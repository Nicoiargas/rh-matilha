import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomAvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  className?: string;
}

export function CustomAvatar({ src, alt, fallback, className }: CustomAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage 
        src={src} 
        alt={alt}
        onError={(e) => {
          // Se a imagem falhar, não mostrar nada (o fallback aparecerá automaticamente)
          e.currentTarget.style.display = 'none';
        }}
      />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
