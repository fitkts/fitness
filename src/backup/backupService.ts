import * as path from 'path';
import * as fs from 'fs-extra';
import archiver from 'archiver';
import * as electronLog from 'electron-log';
import { format } from 'date-fns';
import { app } from 'electron';
import { getDatabase } from '../database/setup';

// 사용자 데이터 경로 안전하게 가져오기
function getUserDataPath(): string {
  try {
    if (app && app.getPath) {
      return app.getPath('userData');
    } else {
      const fallbackPath =
        process.env.APPDATA ||
        process.env.HOME ||
        path.join(__dirname, '../../temp');
      electronLog.warn(
        'Electron app 객체가 준비되지 않음. 대체 경로 사용:',
        fallbackPath,
      );
      return fallbackPath;
    }
  } catch (error) {
    const fallbackPath = path.join(__dirname, '../../temp');
    electronLog.error('사용자 데이터 경로 가져오기 오류:', error);
    return fallbackPath;
  }
}

// 임시 디렉토리 경로 안전하게 가져오기
function getTempPath(): string {
  try {
    if (app && app.getPath) {
      return app.getPath('temp');
    } else {
      return path.join(__dirname, '../../temp');
    }
  } catch (error) {
    return path.join(__dirname, '../../temp');
  }
}

// 백업 생성 함수
export async function createBackup(backupDir: string): Promise<string> {
  try {
    // 현재 날짜와 시간으로 백업 파일명 생성
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const backupFilename = `backup_${timestamp}.zip`;
    const backupPath = path.join(backupDir, backupFilename);

    // 데이터베이스 파일 경로
    const dbPath = path.join(getUserDataPath(), 'fitness.db');

    // zip 파일 생성
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // 최대 압축 레벨
    });

    // 압축이 완료되면 resolve
    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    // 파이프라인 설정
    archive.pipe(output);

    // 데이터베이스 파일 추가
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'fitness.db' });
    }

    // 기타 설정 파일이나 리소스가 있다면 여기에 추가

    // 압축 종료
    await archive.finalize();
    await archivePromise;

    electronLog.info(`백업 생성 완료: ${backupPath}`);
    return backupPath;
  } catch (error) {
    electronLog.error('백업 생성 중 오류 발생:', error);
    throw error;
  }
}

// 백업 복원 함수
export async function restoreBackup(backupPath: string): Promise<boolean> {
  try {
    const dbPath = path.join(getUserDataPath(), 'fitness.db');

    // 기존 데이터베이스 연결 종료
    getDatabase().close();

    // 임시 디렉토리 생성
    const tempDir = path.join(getTempPath(), 'fitness-restore');
    await fs.ensureDir(tempDir);

    // 추후 구현 예정
    // 백업 파일 압축 해제 및 복원 로직

    return true;
  } catch (error) {
    electronLog.error('백업 복원 중 오류 발생:', error);
    return false;
  }
}

// 백업 목록 가져오기
export async function getBackupList(backupDir: string): Promise<string[]> {
  try {
    await fs.ensureDir(backupDir);
    const files = await fs.readdir(backupDir);
    return files
      .filter((file) => file.startsWith('backup_') && file.endsWith('.zip'))
      .sort()
      .reverse(); // 최신 백업이 먼저 오도록 정렬
  } catch (error) {
    electronLog.error('백업 목록 가져오기 오류:', error);
    return [];
  }
}
