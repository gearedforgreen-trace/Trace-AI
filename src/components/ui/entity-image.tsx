import Image from "next/image";

interface EntityImageProps {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}

export function EntityImage({
  src,
  alt,
  size = 40,
  className,
}: EntityImageProps) {
  return (
    <div
      className={`relative rounded-md overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src || `/placeholder.svg?height=${size}&width=${size}`}
        alt={alt}
        fill
        className="object-cover"
      />
    </div>
  );
}
