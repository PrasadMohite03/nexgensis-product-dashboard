"use client";

import React, { useState, useEffect } from "react";

/**
 * ProductGallery Component
 * Renders main product image with interactive thumbnail navigation.
 */
export default function ProductGallery({ images = [], thumbnail = "", title = "Product" }) {
  const imageList = Array.isArray(images) && images.length > 0
    ? images
    : thumbnail
    ? [thumbnail]
    : ["https://placehold.co/600x600?text=No+Image"];

  const [selectedImage, setSelectedImage] = useState(imageList[0]);

  // Keep selected image in sync if product/images prop changes
  useEffect(() => {
    if (imageList.length > 0) {
      setSelectedImage(imageList[0]);
    }
  }, [images, thumbnail]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Main View Image ──────────────────────────────────────────────── */}
      <div className="relative aspect-square w-full bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-center overflow-hidden shadow-sm group">
        <img
          src={selectedImage}
          alt={title}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://placehold.co/600x600?text=Image+Unavailable";
          }}
        />
      </div>

      {/* ── Thumbnails Row (Shown only if > 1 image) ─────────────────────── */}
      {imageList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
          {imageList.map((imgUrl, index) => {
            const isSelected = selectedImage === imgUrl;
            return (
              <button
                key={`${imgUrl}-${index}`}
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative w-20 h-20 rounded-xl bg-white border-2 overflow-hidden flex-shrink-0 p-1.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isSelected
                    ? "border-indigo-600 shadow-md ring-2 ring-indigo-100"
                    : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/80x80?text=?";
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
