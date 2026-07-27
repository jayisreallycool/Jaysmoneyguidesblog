import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ fallbackSrc = '/images/jays-mascot-logo.webp', ...props }) => {
  const [imgSrc, setImgSrc] = useState(props.src);

  return (
    <img
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
};
