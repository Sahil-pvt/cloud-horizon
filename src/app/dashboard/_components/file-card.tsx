import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "date-fns";

import { Doc } from "../../../../convex/_generated/dataModel";
import { FileIcon, FileTextIcon, GanttChartIcon, ImageIcon, MoreVertical, StarHalf, StarIcon, TrashIcon, UndoIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Protect } from "@clerk/nextjs";
import { getUserProfile } from "../../../../convex/users";
//   import { FileCardActions } from "./file-actions";

export function FileCardActions({
    file,
    isFavorited,
}: {
    file: Doc<"files"> & { url: string | null };
    isFavorited: boolean;
}) {
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const { toast } = useToast();
    // const me = useQuery(api.users.getMe);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    return (
        <>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will mark the file for our deletion process. Files are
                            deleted periodically
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                await deleteFile({
                                    fileId: file._id,
                                });
                                toast({
                                    variant: "default",
                                    title: "File marked for deletion",
                                    description: "Your file will be deleted soon",
                                });
                            }}
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem
                        onClick={() => {
                            if (!file.url) return;
                            window.open(file.url, "_blank");
                        }}
                        className="flex gap-1 items-center cursor-pointer"
                    >
                        <FileIcon className="w-4 h-4" /> Download
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={() => {
                            toggleFavorite({
                                fileId: file._id,
                            });
                        }}
                        className="flex gap-1 items-center cursor-pointer"
                    >
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
                        <DropdownMenuItem
                            onClick={() => {
                                if (file.shouldDelete) {
                                    restoreFile({
                                        fileId: file._id,
                                    });
                                } else {
                                    setIsConfirmOpen(true);
                                }
                            }}
                            className="flex gap-1 items-center cursor-pointer"
                        >
                            {file.shouldDelete ? (
                                <div className="flex gap-1 text-green-600 items-center cursor-pointer">
                                    <UndoIcon className="w-4 h-4" /> Restore
                                </div>
                            ) : (
                                <div className="flex gap-1 text-red-600 items-center cursor-pointer">
                                    <TrashIcon className="w-4 h-4" /> Delete
                                </div>
                            )}
                        </DropdownMenuItem>
                        </Protect>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}


export function FileCard({
    file,
}: {
    file: Doc<"files"> & { isFavorited: boolean; url: string | null };
}) {
    const userProfile = useQuery(api.users.getUserProfile, {
        userId: file.userId,
    });

    const typeIcons = {
        image: <ImageIcon />,
        pdf: <FileTextIcon />,
        csv: <GanttChartIcon />,
    } as Record<Doc<"files">["type"], ReactNode>;

    return (
        <Card>
            <CardHeader className="relative">
                <CardTitle className="flex gap-2 text-base font-normal">
                    <div className="flex justify-center">{typeIcons[file.type]}</div>{" "}
                    {file.name}
                </CardTitle>
                <div className="absolute top-2 right-2">
                    <FileCardActions isFavorited={file.isFavorited} file={file} />
                </div>
            </CardHeader>
            <CardContent className="h-[200px] flex justify-center items-center">
                {file.type === "image" && file.url && (
                    <Image alt={file.name} width="200" height="100" src={file.url} />
                )}

                {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
                {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={userProfile?.image} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    {userProfile?.name}
                </div>
                <div className="text-xs text-gray-700">
                    Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
                </div>
            </CardFooter>
        </Card>
    );
}