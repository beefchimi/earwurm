async function fetchRequest(path: string, options?: RequestInit) {
  const audioRequest = new Request(path, options);

  // eslint-disable-next-line ts/return-await
  return await fetch(audioRequest).then((response) => {
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
  // eslint-disable-next-line ts/return-await
  return await fetchRequest(path, options)
    // eslint-disable-next-line ts/return-await
    .then(async (response) => await response.arrayBuffer())
    // eslint-disable-next-line ts/return-await
    .then(async (arrayBuffer) => await context.decodeAudioData(arrayBuffer));
}
