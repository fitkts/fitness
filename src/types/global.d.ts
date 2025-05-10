export {};

declare global {
  interface Window {
    electron: any; // 필요하다면 any 대신 정확한 타입으로 바꿔도 됩니다.
  }
}
