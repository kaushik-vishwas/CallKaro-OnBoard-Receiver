import {apiRequest, getApiBaseUrl} from './client';

export type OnboardingReceiver = {
  id: string;
  name: string;
  age: number;
  gender: string;
  level: number;
  status: string;
  rejectionReason?: string;
  bio: string;
  languages: string[];
  photos: string[];
  bank: {
    holderName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
  kyc: {
    videoUrl?: string;
    videoThumb?: string;
    documents: Array<{
      id: string;
      title: string;
      sizeLabel: string;
      thumbnail: string;
      url: string;
    }>;
  };
};

export type OnboardingPayload = {
  bio?: string;
  languages?: string[];
  photos?: string[];
  bank?: OnboardingReceiver['bank'];
  kyc?: {
    videoUrl?: string;
    videoThumb?: string;
    documents?: OnboardingReceiver['kyc']['documents'];
  };
};

export type UploadResult = {
  url: string;
  key: string;
  size: number;
  docType?: string;
};

export async function fetchOnboarding(token: string) {
  return apiRequest<{receiver: OnboardingReceiver}>(
    `/receiver/onboard/${encodeURIComponent(token)}`,
  );
}

export async function saveOnboarding(token: string, payload: OnboardingPayload) {
  return apiRequest<{receiver: OnboardingReceiver}>(
    `/receiver/onboard/${encodeURIComponent(token)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}

export async function submitOnboarding(token: string, payload: OnboardingPayload) {
  return apiRequest<{receiver: OnboardingReceiver}>(
    `/receiver/onboard/${encodeURIComponent(token)}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function retryOnboarding(token: string) {
  return apiRequest<{receiver: OnboardingReceiver}>(
    `/receiver/onboard/${encodeURIComponent(token)}/retry`,
    {method: 'POST'},
  );
}

async function parseUpload(response: Response): Promise<UploadResult> {
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Upload failed');
  }
  return payload.data ?? payload;
}

export async function uploadPhoto(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${getApiBaseUrl()}/uploads/photo`, {
    method: 'POST',
    body: formData,
  });
  return parseUpload(response);
}

export async function uploadPhotos(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  const response = await fetch(`${getApiBaseUrl()}/uploads/photos`, {
    method: 'POST',
    body: formData,
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Upload failed');
  }
  const data = payload.data ?? payload;
  return data.files;
}

export async function uploadDocument(
  file: File,
  docType: string,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);
  const response = await fetch(`${getApiBaseUrl()}/uploads/document`, {
    method: 'POST',
    body: formData,
  });
  return parseUpload(response);
}

export async function uploadVideo(file: Blob, filename = 'verification.webm') {
  const formData = new FormData();
  formData.append('file', file, filename);
  const response = await fetch(`${getApiBaseUrl()}/uploads/video`, {
    method: 'POST',
    body: formData,
  });
  return parseUpload(response);
}
