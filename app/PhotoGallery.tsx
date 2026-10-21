import type { CSSProperties } from "react";
import "./photos.css";

const photos = [
  {
    file: "narda-saul-01.jpg",
    width: 1288, height: 1221,
    alt: "Narda y Saúl abrazados en una lancha frente a un arco natural junto al mar.",
  },
  {
    file: "narda-saul-02.jpg",
    width: 1086, height: 1448,
    alt: "Retrato de Narda y Saúl juntos, vestidos para una ocasión especial.",
  },
  {
    file: "narda-saul-03.jpg",
    width: 1144, height: 1375,
    alt: "Narda y Saúl a caballo durante un paseo por el bosque.",
  },
  {
    file: "narda-saul-04.jpg",
    width: 1086, height: 1448,
    alt: "Narda y Saúl se dan un beso en las gradas de un concierto.",
  },
  {
    file: "narda-saul-05.jpg",
    width: 1544, height: 1018,
    alt: "Narda y Saúl se besan mientras pasean en camello por la playa.",
  },
  {
    file: "narda-saul-06.jpg",
    width: 1122, height: 1402,
    alt: "Narda y Saúl juntos en un jardín de agaves.",
  },
];

type Photo = (typeof photos)[number];
const portraitOrder = ["narda-saul-02.jpg", "narda-saul-06.jpg", "narda-saul-03.jpg", "narda-saul-04.jpg"];
const portraitPhotos = portraitOrder.map(file => photos.find(photo => photo.file === file)!);
const travelPhotos = [photos[0], photos[4]];

function PhotoFrame({ photo }: { photo: Photo }) {
  return (
    <figure className="photo-frame">
      <div className="photo-window" style={{ "--image-ratio": `${photo.width} / ${photo.height}` } as CSSProperties}>
        <img
          src={`images/couple/${photo.file}`}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
        />
      </div>
    </figure>
  );
}

export default function PhotoGallery() {
  return (
    <div className="photo-gallery" role="group" aria-label="Fotografías de Narda y Saúl">
      {portraitPhotos.map(photo => <PhotoFrame photo={photo} key={photo.file}/>)}
      <div className="photo-travel-pair">
        {travelPhotos.map(photo => <PhotoFrame photo={photo} key={photo.file}/>)}
      </div>
    </div>
  );
}
