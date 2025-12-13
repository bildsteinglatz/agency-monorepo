import React from "react";
import Link from "next/link";
import { Artwork } from "@/types/artwork";

function extractVimeoId(vimeoUrl: string): string {
  const match = vimeoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : "";
}

const getAssetUrl = (maybeAsset: any): string | undefined => {
  if (!maybeAsset) return undefined;
  if (typeof maybeAsset === 'string') return maybeAsset;
  if (maybeAsset?.url) return maybeAsset.url;
  if (maybeAsset?.asset?.url) return maybeAsset.asset.url;
  return undefined;
}

export default function BlogArtworkLayout({ artwork }: { artwork: Artwork }) {
  const vimeoUrl = (artwork as any).vimeoVideo?.vimeoUrl;

  return (
    <div className="max-w-4xl left-offset">
      {/* Main Image or Vimeo */}
  {vimeoUrl ? (
        <div className="mb-8 w-full max-w-[800px] aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${extractVimeoId(vimeoUrl)}?loop=1&dnt=1`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={artwork.title || "Artwork video"}
            style={{ borderRadius: 0, width: "100%", height: "100%" }}
          />
        </div>
      ) : getAssetUrl(artwork.mainImage) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="mb-8">
          <img
            src={String(getAssetUrl(artwork.mainImage))}
            alt={artwork.title || "Artwork"}
            style={{ 
              width: "100%", 
              height: "auto", 
              objectFit: "contain", 
              borderRadius: 0, 
              background: "var(--filterbar-link-bg)" 
            }}
            loading="lazy"
          />
        </div>
      ) : null}

      {/* Title and Basic Info */}
      <div className="mb-6">
        <h1 className="text-3xl title-text mb-2">{artwork.title}{artwork.year ? `, ${artwork.year}` : ""}</h1>
        <div className="text-base space-y-1">
          {artwork.technique && <div>Technique: {artwork.technique}</div>}
          {artwork.edition && <div>Edition: {artwork.edition}</div>}
          {artwork.size && <div>Size: {artwork.size}</div>}
        </div>
      </div>

      <div className="mb-8"></div>

      {/* Description/Notes */}
      {artwork.notes && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">About this Work</h2>
            <div className="prose max-w-none">
              <p>{artwork.notes}</p>
            </div>
          </div>
          {/* Gap */}
          <div className="mb-8"></div>
        </>
      )}

      {/* Image Gallery Placeholder */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Additional Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Placeholder for additional images */}
          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
            Additional images will appear here
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Related Links</h3>
        <div className="space-y-2">
          {artwork.fieldOfArt && (
            <Link 
              href={`/new-work?layer=fieldOfArt&fieldOfArt=${artwork.fieldOfArt._id}`}
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              More works in {artwork.fieldOfArt.title}
            </Link>
          )}
          {artwork.bodyOfWork && (
            <Link 
              href={`/new-work?layer=bodyOfWork&bodyOfWork=${artwork.bodyOfWork._id}`}
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              More works from {artwork.bodyOfWork.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
