"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { UploadButton } from "./upload-button";
import { FileCard } from "./file-card";
import Image from "next/image";
import { FileIcon, Loader2, StarIcon } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Placeholder() {
  return (
    <div className="flex flex-col gap-8 w-full items-center mt-24">
      <Image
        alt="empty image"
        width="300"
        height="300"
        src="/empty.svg"
      />
      <div className="text-2xl">You have no files, upload one now!</div>
      <UploadButton />
    </div>
  )
}


export function FilesBrowser({ title, favoritesOnly, deletedOnly, }: { title: string; favoritesOnly?: boolean; deletedOnly?: boolean; }) {

  const organization = useOrganization();

  const user = useUser();

  const [query, setQuery] = useState("");

  let orgId: string | undefined = undefined;

  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id
  }

  const favorites = useQuery(api.files.getAllFavorites,
    orgId ? { orgId } : 'skip',
  );


  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites: favoritesOnly, deletedOnly } : 'skip');
  const isLoading = files === undefined;

  return (
    <div>
          {isLoading && <div className="flex flex-col gap-8 w-full items-center mt-24">
            <Loader2 className="w-24 h-24 mx-auto animate-spin text-gray-500" />
            <div className="text-2xl" >Loading you files...</div>
          </div>}

          {/* {!isLoading && !query && files.length === 0 && (
        <Placeholder />
      )} */}

          {!isLoading && (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">{title}</h1>

                <SearchBar query={query} setQuery={setQuery} />
                <UploadButton />
              </div>

              {files.length === 0 && (
                <Placeholder />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {files?.map(file => {
                  return <FileCard favorites={favorites ?? []} key={file._id} file={file} />
                })}
              </div>
            </>
          )}
        </div>
  );
}
