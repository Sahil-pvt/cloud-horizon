import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DeleteIcon, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TextIcon, TrashIcon, UndoIcon } from "lucide-react";
import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";


function FileCardActions({ file, isFavorited }: { file: Doc<"files">; isFavorited: boolean; }) {
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const { toast } = useToast();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for deletion process. Files are deleted periodically.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => {
                            await deleteFile({
                                fileId: file._id
                            });
                            toast({
                                variant: "default",
                                title: "File marked for deletion",
                                description: "Your file will be deleted soon.",
                            });
                        }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                        toggleFavorite({
                            fileId: file._id,
                        })
                    }} className="flex gap-1 items-center cursor-pointer">
                        {isFavorited ? (
                            <div className="flex gap-1 items-center"><StarHalf className="h-4 w-4" /> Unfavorite</div>

                        ) : (
                            <div className="flex gap-1 items-center"><StarIcon className="h-4 w-4" /> Favorite</div>
                        )}
                    </DropdownMenuItem>

                    <Protect
                        role="org:admin"
                        fallback={<></>}>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            if (file.shouldDelete) {
                                restoreFile({
                                    fileId: file._id,
                                })
                            } else {
                                setIsConfirmOpen(true)
                            }
                        }} className="flex gap-1 items-center cursor-pointer">
                            {file.shouldDelete ? <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                                <UndoIcon className="h-4 w-4" /> Restore
                            </div> : <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                                <TrashIcon className="h-4 w-4" /> Delete
                            </div>
                            }
                        </DropdownMenuItem>
                    </Protect>
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    )
}

function getFileUrl(fileId: Id<"_storage">): string {
    return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`;
    // https://outstanding-minnow-51.convex.cloud/api/storage/7b12f7e3-9f5d-4862-a58b-a4b33d975c68
}

export function FileCard({ file, favorites }: { file: Doc<"files">; favorites: Doc<"favorites">[]; }) {
    const typesIcons = {
        "image": <ImageIcon />,
        "pdf": <FileTextIcon />,
        "csv": <GanttChartIcon />,
    } as Record<Doc<"files">["type"], ReactNode>;
    const isFavorited = favorites.some((favorite) => favorite.fileId === file._id);
    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2">
                    <div className="flex justify-center">{typesIcons[file.type]}</div>
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2"><FileCardActions isFavorited={isFavorited} file={file} /></div>
                {/* <CardDescription>Card Description</CardDescription> */}
            </CardHeader>
            <CardContent className="h-[200px] flex justify-center items-center">
                {/* {file.type === "image" && (<Image alt={file.name} src={getFileUrl(file.fileId)} width="200" height="100" />)} */}
                {file.type === "image" && <ImageIcon className="w-20 h-20" />}
                {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
                {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}

            </CardContent>
            <CardFooter className="flex justify-center">
                <Button onClick={() => window.open(getFileUrl(file.fileId), "_blank")}>Download</Button>
            </CardFooter>
        </Card>

    )
}