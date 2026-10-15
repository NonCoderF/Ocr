# OCR Clean Architecture

## Final structure

```text
src/
├── app/                                      # Expo Router route entry points
│   ├── App.tsx                               # Existing root screen composition
│   ├── index.tsx
│   ├── analysis/analysis.tsx                 # Preserved /analysis/analysis route
│   └── camera/                               # Compatibility route wrappers
├── features/
│   ├── camera/presentation/
│   │   ├── screens/CameraScreen.tsx
│   │   ├── components/{CameraPermissionView,CaptureBottomSheet}.tsx
│   │   └── hooks/useCameraCapture.ts
│   └── analysis/
│       ├── domain/{models,repositories,usecases}
│       ├── data/{dto,mappers,remote,repositories}
│       └── presentation/{screens,components,hooks}
├── di/container.ts                            # Composition root
└── shared/utils/capturedImage.ts               # Small capture hand-off store
```

Tests live in `tests/` and are independent of live Supabase services.

## Responsibilities and dependency direction

Presentation owns React components, navigation, camera permissions, animations, and UI state. The domain owns `Analysis`, the repository contract, and the `AnalyzeImageUseCase`; it has no React, Expo, Supabase, HTTP, or file-system dependency. Data owns the Supabase upload adapter, Zod DTO validation, DTO-to-domain mapping, and repository implementation. The composition root wires `AnalysisApi → AnalysisRepositoryImpl → AnalyzeImageUseCase`.

Dependencies point inward: presentation depends on domain contracts, data implements domain contracts, and only the composition root knows the concrete classes.

## Image analysis flow

```text
CameraView
  → useCameraCapture.takePictureAsync({ base64: true })
  → local URI saved in capturedImage + preview shown in CaptureBottomSheet
  → user taps Analyze
  → preserved router path /analysis/analysis
  → useAnalysis creates request id + AbortController
  → AnalyzeImageUseCase validates the local URI
  → AnalysisRepositoryImpl calls AnalysisApi
  → expo-file-system multipart upload to the existing Supabase Edge Function
  → JSON parsed and validated by Zod
  → mapper returns domain Analysis
  → hook publishes success, error, or ignores stale/cancelled response
  → AnalysisScreen renders summary, dynamic details, extracted text, confidence
```

The client contains only the existing public function URL. No service-role key or backend secret is embedded.

## DTO validation, errors, and cancellation

Zod rejects malformed responses and confidence values outside `0..1`. The API adapter distinguishes invalid JSON from non-2xx responses and preserves structured API error payloads. `useAnalysis` cancels the prior request on retry/unmount, checks the request id before committing state, and ignores aborted responses. Expo FileSystem legacy upload does not expose a native abort handle, so cancellation is cooperative at the adapter boundary: a completed upload cannot update state after cancellation.

## UI state

`useAnalysis` exposes `analyzing`, `data`, `errorMessage`, `retry`, and `cancel`. The screen keeps the existing loading animation, error/retry UI, result layout, dynamic detail rows, and back navigation. `useCameraCapture` keeps the camera ref and capture/preview hand-off out of the screen component.

## Testing strategy

`tests/analysis.test.ts` covers use-case business rules, cancellation, DTO validation, dynamic details, mapper behavior, and repository delegation. `tests/analysisApi.test.ts` mocks Expo FileSystem and covers multipart requests, malformed JSON, API errors, and preflight cancellation. `tests/useAnalysis.test.tsx` covers hook success/error/retry and stale-response protection. No test contacts Supabase.

## Trade-offs

The architecture is intentionally lightweight. The latest captured image remains a small module-level hand-off because the existing route contract does not carry a URI parameter and adding global state would be disproportionate. The API retains Expo FileSystem’s multipart upload to preserve the current backend contract; cancellation is therefore cooperative rather than a hard network abort. Compatibility route files remain so existing route paths continue to resolve, while feature code is outside `src/app` and cannot accidentally become a screen.

## Native Android comparison

| Android | React Native |
|---|---|
| Compose | React components |
| ViewModel | Custom hooks (`useAnalysis`, `useCameraCapture`) |
| StateFlow | React state and render-driven state |
| Retrofit | `AnalysisApi` plus Expo FileSystem upload |
| Repository interface | TypeScript `AnalysisRepository` interface |
| Use case | `AnalyzeImageUseCase` TypeScript class |
| Hilt | Constructor injection from `src/di/container.ts` |
| Coroutines | Promises and `async`/`await`, with cooperative cancellation |

These are useful analogies, not identical runtime primitives. Compose/ViewModel/StateFlow are Kotlin and Android lifecycle tools; React renders from hook state and Expo Router owns navigation. Retrofit and Hilt provide native integrations that are replaced here by a small adapter and explicit constructor wiring. Coroutine cancellation can interrupt structured coroutine work, whereas the current Expo FileSystem upload can only prevent a result from being committed after cancellation.

