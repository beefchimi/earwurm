async function fetchRequest(path: string, options?: RequestInit) {
  const audioRequest = new Request(path, options);

  return fetch(audioRequest).then((response) => {
    if (!response.ok) {
      throw new Error(`Network status: ${response.status}`);
    }

    return response;
  });
}

export async function fetchAudioBuffer(
  path: string,
  context: AudioContext,
  options?: RequestInit,
) {
  return fetchRequest(path, options)
    .then(async (response) => response.arrayBuffer())
    .then(async (arrayBuffer) => context.decodeAudioData(arrayBuffer));
}
