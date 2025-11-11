"use client";

import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";

interface ResponsiveImageProps extends Omit<ImageProps, 'width' | 'height'> {
  width?: number | "auto";
  height?: number | "auto";
  maintainAspectRatio?: boolean;
  className?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width = "auto",
  height = "auto",
  maintainAspectRatio = true,
  className,
  ...props
}) => {
  const imgWidth = width === "auto" ? 500 : width;
  const imgHeight = height === "auto" ? 500 : height;
  const imageStyle: React.CSSProperties = {
    width: width === "auto" ? "auto" : undefined,
    height: height === "auto" ? "auto" : undefined,
    maxWidth: "100%",
    objectFit: maintainAspectRatio ? "contain" : "cover" as "contain" | "cover",
  };

  return (
    <Image
      src={src}
      alt={alt}
      width={imgWidth}
      height={imgHeight}
      style={imageStyle}
      className={cn("", className)}
      {...props}
    />
  );
}; 