'use client';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FilesBrowser } from "../_components/file-browser";

export default function FavouritesPage() {

    return (
        <div>
            <FilesBrowser title="Favorites" favorites />
        </div>
    );
}