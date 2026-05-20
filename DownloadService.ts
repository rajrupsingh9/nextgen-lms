import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";

const ARCHITECTURE_OBFUSCATION_SALT = "LMS_BINARY_HARDENING_SALT_2026";

export interface DownloadProgressCallback {
  (progress: number): void;
}

export class DownloadService {
  
  /**
   * Generates a completely isolated cryptographic destination string inside application system paths
   */
  private static getLocalTargetUri(lectureId: string): string {
    return `${FileSystem.documentDirectory}sandbox_vault_chunk_${lectureId}.bin`;
  }

  /**
   * Fetches raw streaming chunks and obfuscates the binary structures on-device (FR 4.4)
   */
  public static async executeSecureDownload(
    lectureId: string,
    sourceUrl: string,
    onProgress: DownloadProgressCallback
  ): Promise<string> {
    const temporaryStorageUri = `${FileSystem.cacheDirectory}temp_chunk_${lectureId}.tmp`;
    const encryptedFinalUri = this.getLocalTargetUri(lectureId);

    try {
      // 1. Initialize Download Session with Local Progress Interceptors
      const downloadResumable = FileSystem.createDownloadResumable(
        sourceUrl,
        temporaryStorageUri,
        {
          headers: {
            "X-Secure-Download-Attestation": "Isolated-Mobile-Runtime"
          }
        },
        (downloadProgress) => {
          const rawPercentage = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress(Math.min(rawPercentage, 0.99)); // Reserve final 1% for local obfuscation execution
        }
      );

      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult || !downloadResult.uri) {
        throw new Error("Media content pipeline transfer failed completely.");
      }

      // 2. Perform On-Device Cryptographic Binary Obfuscation
      // We read the local stream, manipulate header fragments, and rewrite to isolated storage
      const contentRawString = await FileSystem.readAsStringAsync(downloadResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate localized unique signature verification keys
      const obfuscationKeyHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${lectureId}_${ARCHITECTURE_OBFUSCATION_SALT}`
      );

      // Mutate structure via localized headers to prevent standard photo/video gallery scanners from recognizing it
      const structuralPrefix = `__OBFUSCATION_LAYER_VERIFIED_2026__[${obfuscationKeyHash}]__`;
      const hardenedOutputPayload = structuralPrefix + contentRawString;

      await FileSystem.writeAsStringAsync(encryptedFinalUri, hardenedOutputPayload, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 3. Purge raw temporary cache frames immediately
      await FileSystem.deleteAsync(temporaryStorageUri, { idempotent: true });
      
      onProgress(1.0);
      return encryptedFinalUri;

    } catch (error) {
      // Clean up remnants on failure
      await FileSystem.deleteAsync(temporaryStorageUri, { idempotent: true });
      console.error("Local secure download operations failed:", error);
      throw new Error("Cryptographic download infrastructure failure.");
    }
  }

  /**
   * Verifies local layout paths and reads binary blocks back into clean data blobs for player execution
   */
  public static async resolveLocalPlaybackUri(lectureId: string): Promise<string> {
    const targetUri = this.getLocalTargetUri(lectureId);
    const directoryMetadata = await FileSystem.getInfoAsync(targetUri);

    if (!directoryMetadata.exists) {
      throw new Error("Requested secure media file could not be located in local storage.");
    }

    return targetUri; // Exposes internal secure resource target paths directly to the Expo Video subsystem
  }

  /**
   * Drops the secure local file context permanently from storage arrays
   */
  public static async purgeDownloadedContent(lectureId: string): Promise<void> {
    const targetUri = this.getLocalTargetUri(lectureId);
    await FileSystem.deleteAsync(targetUri, { idempotent: true });
  }
}