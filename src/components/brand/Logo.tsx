"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  className?: string;
  theme?: "dark" | "light";
}

export default function Logo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
  theme = "dark",
}: LogoProps) {
  const sizeMap = {
    sm: { img: 36, text: "text-base", sub: "text-[10px]" },
    md: { img: 46, text: "text-lg", sub: "text-xs" },
    lg: { img: 60, text: "text-2xl", sub: "text-xs" },
    xl: { img: 80, text: "text-3xl", sub: "text-sm" },
  };

  const { img, text, sub } = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-3.5 ${className}`}>
      {/* High-Resolution Cropped Emblem */}
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl border-2 border-[#c5a059]/60 shadow-xl shadow-black/50 bg-[#0c131f] flex items-center justify-center p-0.5 group"
        style={{ width: img, height: img }}
      >
        <Image
          src="/images/rewaq-mark.png"
          alt="رِواق ERP - Rewaq Logo"
          width={img * 2}
          height={img * 2}
          className="object-contain w-full h-full scale-105"
          priority
        />
      </div>

      {/* Brand Name & Tagline */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 leading-none">
            <span className={`font-black tracking-wider ${theme === "dark" ? "text-white" : "text-slate-900"} ${text}`}>
              REWAQ
            </span>
            <span className={`font-black text-[#c5a059] tracking-wider ${text}`}>
              ERP
            </span>
          </div>
          <span className={`font-semibold tracking-normal mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"} ${sub}`}>
            منظومة معارض الأثاث والديكور
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
