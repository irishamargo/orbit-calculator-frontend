import { useEffect, useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createDraft, fetchDraft, publishDraft } from "./orbitsSlice";
import { DEFAULT_IMAGE, DEFAULT_VIDEO } from "./types";

type MediaInputsProps = {
  imagePreview: string;
  videoPreview: string;
  imageFileName?: string;
  videoFileName?: string;
  selectable: boolean;
  onImageChange: (file?: File) => void;
  onVideoChange: (file?: File) => void;
};

function MediaInputs({
  imagePreview,
  videoPreview,
  imageFileName,
  videoFileName,
  selectable,
  onImageChange,
  onVideoChange,
}: MediaInputsProps) {
  const imageContent = (
    <>
      <img
        src={imagePreview || DEFAULT_IMAGE}
        alt="Предпросмотр изображения орбиты"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = DEFAULT_IMAGE;
        }}
      />
      <span className="upload-caption">
        {imageFileName || (selectable ? "Выбрать фото" : "Фото орбиты")}
      </span>
    </>
  );
  const videoContent = (
    <>
      <video
        className="upload-video-preview"
        src={videoPreview || DEFAULT_VIDEO}
        autoPlay
        loop
        muted
        playsInline
      />
      <span className="upload-caption">
        {videoFileName || (selectable ? "Выбрать видео" : "Видео орбиты")}
      </span>
    </>
  );

  return (
    <>
      <span className="field-label">Фото</span>
      {selectable ? (
        <label className="upload-box photo-upload" htmlFor="orbit-image">
          {imageContent}
          <input
            id="orbit-image"
            className="file-input"
            type="file"
            accept="image/*"
            onChange={(event) => onImageChange(event.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="upload-box photo-upload media-preview-only">{imageContent}</div>
      )}

      <span className="field-label">Видео</span>
      {selectable ? (
        <label className="upload-box video-upload" htmlFor="orbit-video">
          {videoContent}
          <input
            id="orbit-video"
            className="file-input"
            type="file"
            accept="video/*"
            onChange={(event) => onVideoChange(event.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="upload-box video-upload media-preview-only">{videoContent}</div>
      )}
    </>
  );
}

export default function AddPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const { draft, loading, error } = useAppSelector((state) => state.orbits);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [height, setHeight] = useState("");
  const [inclination, setInclination] = useState("");
  const [imageFile, setImageFile] = useState<File>();
  const [videoFile, setVideoFile] = useState<File>();

  useEffect(() => {
    if (user) void dispatch(fetchDraft());
  }, [dispatch, user]);

  useEffect(() => {
    if (!draft) return;
    setName(draft.name);
    setDescription(draft.description ?? "");
    setHeight(draft.height === null ? "" : String(draft.height));
    setInclination(draft.inclination === null ? "" : String(draft.inclination));
  }, [draft]);

  const imagePreview = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : draft?.image || DEFAULT_IMAGE),
    [draft?.image, imageFile],
  );
  const videoPreview = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : draft?.video || DEFAULT_VIDEO),
    [draft?.video, videoFile],
  );

  useEffect(
    () => () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
      if (videoPreview.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
    },
    [imagePreview, videoPreview],
  );

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  async function saveMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await dispatch(
        createDraft({ name: name.trim(), image: imageFile, video: videoFile }),
      ).unwrap();
      setStep(2);
    } catch {
      // The shared request message displays the API error.
    }
  }

  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await dispatch(
        publishDraft({
          description: description.trim() || null,
          height: height.trim() === "" ? null : Number(height),
          inclination: inclination.trim() === "" ? null : Number(inclination),
        }),
      ).unwrap();
      navigate("/orbit-type/grid");
    } catch {
      // The shared request message displays the API error.
    }
  }

  return (
    <main className="page add-page">
      <h1>Добавление типа орбиты</h1>
      <p className="draft">Шаг {step} из 2</p>
      {step === 1 ? (
        <Form onSubmit={(event) => void saveMedia(event)}>
          <MediaInputs
            imagePreview={imagePreview}
            videoPreview={videoPreview}
            imageFileName={imageFile?.name}
            videoFileName={videoFile?.name}
            selectable
            onImageChange={setImageFile}
            onVideoChange={setVideoFile}
          />
          <Form.Group controlId="orbit-name">
            <Form.Label>Название</Form.Label>
            <Form.Control
              minLength={2}
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </Form.Group>
          <Button className="primary-action" type="submit" disabled={loading > 0 || name.trim().length < 2}>
            Далее
          </Button>
        </Form>
      ) : (
        <Form onSubmit={(event) => void publish(event)}>
          <MediaInputs
            imagePreview={imagePreview}
            videoPreview={videoPreview}
            imageFileName={imageFile?.name}
            videoFileName={videoFile?.name}
            selectable={false}
            onImageChange={setImageFile}
            onVideoChange={setVideoFile}
          />
          <Form.Group controlId="orbit-name-preview">
            <Form.Label>Название</Form.Label>
            <Form.Control value={name} readOnly />
          </Form.Group>
          <Form.Group controlId="orbit-description">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="orbit-height">
            <Form.Label>Высота, км</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={40000}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="orbit-inclination">
            <Form.Label>Наклонение, °</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={180}
              step="any"
              value={inclination}
              onChange={(event) => setInclination(event.target.value)}
            />
          </Form.Group>
          {error && <p className="form-error">{error}</p>}
          <Button className="secondary-action" type="button" disabled={loading > 0} onClick={() => setStep(1)}>
            Назад
          </Button>
          <Button className="primary-action" type="submit" disabled={loading > 0}>
            Опубликовать
          </Button>
        </Form>
      )}
      {step === 1 && error && <p className="form-error">{error}</p>}
    </main>
  );
}
