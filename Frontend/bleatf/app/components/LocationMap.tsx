'use client';

type LocationMapProps = {
  latitude: number;
  longitude: number;
  title?: string;
};

export default function LocationMap({ latitude, longitude, title }: LocationMapProps) {
  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-4">{title || 'Current Location'}</h3>
      <div className="bg-[var(--color-icon-placeholder)] rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="text-4xl">📍</div>
        </div>
        <p className="font-mono text-lg font-semibold">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        <p className="text-sm text-gray-600 mt-2">
          <a
            href={`https://www.google.com/maps/search/${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] hover:underline"
          >
            View on Google Maps
          </a>
        </p>
      </div>
    </div>
  );
}
