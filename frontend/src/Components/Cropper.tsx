import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop"; // ✅ use "import type"
import { getCroppedImg } from "../utils/cropImage";

type CropperProps = {
  photo: string;
  onCancel: () => void;
  onSave: (croppedImage: string) => void;
};

const CropperModal: React.FC<CropperProps> = ({ photo, onCancel, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const createImage = async () => {
    if (!croppedAreaPixels) return;
    const image = await getCroppedImg(photo, croppedAreaPixels);
    onSave(image);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-xl flex flex-col gap-4 w-[400px]">
        <div className="relative w-full h-[300px] bg-gray-200">
          <Cropper
            image={photo}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={createImage}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
