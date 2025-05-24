# 데이터베이스 스키마 요약

이 문서는 현재 프로젝트의 SQLite 데이터베이스 스키마를 요약합니다.

## 데이터베이스 개요

-   **데이터베이스 종류**: SQLite
-   **데이터베이스 파일명**: `fitness.db` (사용자 데이터 폴더 내에 저장)
-   **라이브러리**: `better-sqlite3`

## 테이블 상세 정보

### 1. `members` - 회원 정보

| 컬럼명             | 데이터 타입      | 제약 조건                               | 설명                                      |
| ------------------ | ---------------- | --------------------------------------- | ----------------------------------------- |
| `id`               | INTEGER          | PRIMARY KEY AUTOINCREMENT               | 회원 고유 ID                               |
| `name`             | TEXT             | NOT NULL                                | 회원 이름                                   |
| `phone`            | TEXT             |                                         | 전화번호                                  |
| `email`            | TEXT             |                                         | 이메일                                    |
| `gender`           | TEXT             |                                         | 성별                                      |
| `birth_date`       | INTEGER          |                                         | 생년월일 (Unix Timestamp)                   |
| `join_date`        | INTEGER          | NOT NULL                                | 가입일 (Unix Timestamp)                     |
| `membership_type`  | TEXT             |                                         | 현재 회원권 종류 (이름)                      |
| `membership_start` | INTEGER          |                                         | 현재 회원권 시작일 (Unix Timestamp)         |
| `membership_end`   | INTEGER          |                                         | 현재 회원권 종료일 (Unix Timestamp)         |
| `last_visit`       | INTEGER          |                                         | 마지막 방문일 (Unix Timestamp)              |
| `notes`            | TEXT             |                                         | 회원 관련 메모                              |
| `staff_id`         | INTEGER          |                                         | 담당 직원 ID (staff.id 참조, 외래 키 제약 없음) |
| `staff_name`       | TEXT             |                                         | 담당 직원 이름                              |
| `created_at`       | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 생성일시 (Unix Timestamp)                 |
| `updated_at`       | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 수정일시 (Unix Timestamp)                 |

**관계:**

-   `staff` 테이블과 `staff_id`로 연관될 수 있습니다. (외래 키 제약은 명시적으로 없음)
-   `attendance`, `payments`, `lockers` 테이블에서 참조됩니다.

### 2. `attendance` - 출석 정보

| 컬럼명       | 데이터 타입 | 제약 조건                               | 설명                      |
| ------------ | ----------- | --------------------------------------- | ------------------------- |
| `id`         | INTEGER     | PRIMARY KEY AUTOINCREMENT               | 출석 고유 ID                |
| `member_id`  | INTEGER     | NOT NULL, FOREIGN KEY (members.id)      | 회원 ID                   |
| `visit_date` | INTEGER     | NOT NULL                                | 방문일 (Unix Timestamp)     |
| `created_at` | INTEGER     | DEFAULT (cast(strftime('%s', 'now') as integer)) | 생성일시 (Unix Timestamp)   |

**관계:**

-   `members` 테이블의 `id`를 `member_id`로 참조합니다.

### 3. `payments` - 결제 정보

| 컬럼명             | 데이터 타입      | 제약 조건                               | 설명                                      |
| ------------------ | ---------------- | --------------------------------------- | ----------------------------------------- |
| `id`               | INTEGER          | PRIMARY KEY AUTOINCREMENT               | 결제 고유 ID                               |
| `member_id`        | INTEGER          | NOT NULL, FOREIGN KEY (members.id)      | 회원 ID                                   |
| `amount`           | INTEGER          | NOT NULL                                | 결제 금액                                   |
| `payment_date`     | INTEGER          | NOT NULL                                | 결제일 (Unix Timestamp)                     |
| `payment_type`     | TEXT             | NOT NULL                                | 결제 구분 (예: 신규, 연장)                   |
| `payment_method`   | TEXT             |                                         | 결제 수단 (예: 카드, 현금)                  |
| `membership_type`  | TEXT             |                                         | 결제한 회원권 종류 (이름)                    |
| `start_date`       | INTEGER          |                                         | 회원권 시작일 (Unix Timestamp)              |
| `end_date`         | INTEGER          |                                         | 회원권 종료일 (Unix Timestamp)              |
| `receipt_number`   | TEXT             |                                         | 영수증 번호                                |
| `status`           | TEXT             | DEFAULT '완료'                          | 결제 상태 (예: 완료, 취소)                  |
| `description`      | TEXT             |                                         | 결제 상세 설명                              |
| `notes`            | TEXT             |                                         | 결제 관련 메모                              |
| `staff_id`         | INTEGER          | FOREIGN KEY (staff.id)                  | 결제 처리 직원 ID                            |
| `created_at`       | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 생성일시 (Unix Timestamp)                 |

**관계:**

-   `members` 테이블의 `id`를 `member_id`로 참조합니다.
-   `staff` 테이블의 `id`를 `staff_id`로 참조합니다.

### 4. `membership_types` - 회원권 종류 정보

| 컬럼명                 | 데이터 타입      | 제약 조건                               | 설명                                  |
| ---------------------- | ---------------- | --------------------------------------- | ------------------------------------- |
| `id`                   | INTEGER          | PRIMARY KEY AUTOINCREMENT               | 회원권 종류 고유 ID                       |
| `name`                 | TEXT             | NOT NULL UNIQUE                         | 회원권 종류 이름                          |
| `price`                | INTEGER          | NOT NULL                                | 가격                                  |
| `duration_months`      | INTEGER          | NOT NULL DEFAULT 1                      | 기간 (개월 수)                            |
| `is_active`            | INTEGER          | DEFAULT 1                               | 활성화 여부 (1: 활성, 0: 비활성)           |
| `description`          | TEXT             |                                         | 설명                                  |
| `max_uses`             | INTEGER          |                                         | 최대 사용 횟수 (PT 등)                   |
| `available_facilities` | TEXT             |                                         | 이용 가능 시설 (JSON 문자열)              |
| `created_at`           | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 생성일시 (Unix Timestamp)             |
| `updated_at`           | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 수정일시 (Unix Timestamp)             |

**관계:**

-   `members` 테이블의 `membership_type` 컬럼과 이름으로 연관될 수 있습니다.
-   `payments` 테이블의 `membership_type` 컬럼과 이름으로 연관될 수 있습니다.

### 5. `staff` - 직원 정보

| 컬럼명        | 데이터 타입      | 제약 조건                               | 설명                                   |
| ------------- | ---------------- | --------------------------------------- | -------------------------------------- |
| `id`          | INTEGER          | PRIMARY KEY AUTOINCREMENT               | 직원 고유 ID                             |
| `name`        | TEXT             | NOT NULL                                | 직원 이름                                |
| `position`    | TEXT             | NOT NULL                                | 직책                                   |
| `phone`       | TEXT             |                                         | 전화번호                                 |
| `email`       | TEXT             |                                         | 이메일                                   |
| `hire_date`   | INTEGER          | NOT NULL                                | 고용일 (Unix Timestamp)                  |
| `status`      | TEXT             | NOT NULL                                | 근무 상태 (예: 재직, 퇴사)               |
| `permissions` | TEXT             | NOT NULL                                | 권한 정보 (JSON 문자열)                  |
| `notes`       | TEXT             |                                         | 직원 관련 메모                             |
| `created_at`  | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 생성일시 (Unix Timestamp)              |
| `updated_at`  | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 수정일시 (Unix Timestamp)              |

**관계:**

-   `payments` 테이블에서 `staff_id`로 참조됩니다.
-   `members` 테이블의 `staff_id` 컬럼과 연관될 수 있습니다. (외래 키 제약은 명시적으로 없음)

### 6. `lockers` - 락커 정보

| 컬럼명        | 데이터 타입      | 제약 조건                               | 설명                               |
| ------------- | ---------------- | --------------------------------------- | ---------------------------------- |
| `id`          | INTEGER          | PRIMARY KEY AUTOINCREMENT               | 락커 고유 ID                         |
| `number`      | TEXT             | NOT NULL UNIQUE                         | 락커 번호                          |
| `status`      | TEXT             | NOT NULL DEFAULT 'available'            | 상태 (예: available, occupied, maintenance) |
| `size`        | TEXT             |                                         | 크기                               |
| `location`    | TEXT             |                                         | 위치                               |
| `fee_options` | TEXT             |                                         | 요금 옵션 (JSON 문자열)               |
| `member_id`   | INTEGER          | FOREIGN KEY (members.id) ON DELETE SET NULL | 사용 회원 ID (회원 삭제 시 NULL로 설정) |
| `start_date`  | INTEGER          |                                         | 사용 시작일 (Unix Timestamp)         |
| `end_date`    | INTEGER          |                                         | 사용 종료일 (Unix Timestamp)         |
| `notes`       | TEXT             |                                         | 락커 관련 메모                       |
| `created_at`  | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 생성일시 (Unix Timestamp)          |
| `updated_at`  | INTEGER          | DEFAULT (cast(strftime('%s', 'now') as integer)) | 수정일시 (Unix Timestamp)          |

**관계:**

-   `members` 테이블의 `id`를 `member_id`로 참조합니다. 회원 삭제 시 `member_id`는 `NULL`로 설정됩니다.

## 데이터 연동성 및 추가 사용 데이터

-   **테이블 간 연동**:
    -   `members` 테이블은 핵심 테이블로, `attendance`, `payments`, `lockers` 테이블과 `member_id`를 통해 직접적인 관계를 맺습니다.
    -   `payments` 테이블은 `staff` 테이블과 `staff_id`를 통해 관계를 맺습니다.
    -   `members` 테이블의 `membership_type` 컬럼과 `payments` 테이블의 `membership_type` 컬럼은 `membership_types` 테이블의 `name`과 연관됩니다 (직접적인 외래 키 제약은 없음).
    -   `members` 테이블의 `staff_id` 컬럼은 `staff` 테이블과 연관될 수 있으나, 외래 키 제약은 명시적으로 설정되어 있지 않습니다.
-   **날짜 데이터 처리**: 모든 날짜/시간 관련 데이터는 Unix Timestamp (초 단위 정수) 형태로 저장되며, 애플리케이션 코드 내에서 ISO 형식의 문자열 (YYYY-MM-DD) 또는 Date 객체로 변환되어 사용됩니다.
-   **JSON 데이터 활용**: `staff` 테이블의 `permissions`, `membership_types` 테이블의 `available_facilities`, `lockers` 테이블의 `fee_options` 컬럼은 JSON 문자열 형태로 복합적인 데이터를 저장합니다.
-   **추가 데이터 사용**: 현재 분석된 파일들 외에 다른 형태의 데이터베이스나 외부 데이터 소스를 사용하는 정황은 발견되지 않았습니다. 모든 주요 데이터는 위에 명시된 SQLite 데이터베이스 테이블 내에서 관리되는 것으로 보입니다.
-   **데이터 일관성**:
    -   회원(`members`) 삭제 시, 관련된 출석(`attendance`) 및 결제(`payments`) 기록도 함께 삭제되는 트랜잭션 처리가 `memberRepository.ts` 및 `memberService.ts`에 구현되어 있어 데이터 무결성을 유지하려는 노력이 보입니다.
    -   락커(`lockers`)의 경우, 할당된 회원이 삭제되면 `member_id`가 `NULL`로 설정되도록 `ON DELETE SET NULL` 제약 조건이 설정되어 있습니다.

## 개선 및 고려 사항

-   **외래 키 제약 조건**: `members` 테이블의 `staff_id`가 `staff` 테이블을 참조하지만 외래 키 제약 조건이 명시되어 있지 않습니다. 데이터 무결성을 강화하기 위해 추가하는 것을 고려할 수 있습니다. 마찬가지로 `members.membership_type`과 `payments.membership_type`이 `membership_types.name`을 참조하는 관계도 명확히 하기 위해 별도의 ID를 사용하거나 외래 키 제약을 고려할 수 있습니다. (현재는 이름으로 연결)
-   **인덱싱**: 자주 검색되는 컬럼 (예: `members.name`, `members.phone`, `payments.payment_date` 등)에 대한 인덱스 생성은 대량 데이터 조회 시 성능 향상에 도움이 될 수 있습니다. `setup.ts`에서 테이블 생성 시 인덱스 정의를 추가할 수 있습니다.
-   **`memberService.ts` 와 `*Repository.ts` 역할**: `memberService.ts`는 `memberRepository.ts`와 유사한 데이터 접근 로직을 직접 구현하고 있습니다. 향후 유지보수 및 역할 분담을 명확히 하기 위해 서비스 계층은 레포지토리 계층을 호출하여 비즈니스 로직에 집중하고, 실제 데이터베이스 접근은 레포지토리에서 전담하도록 구조를 일관성 있게 가져가는 것을 고려해볼 수 있습니다. 현재 `memberRepository.ts`가 더 많은 기능을 상세하게 구현하고 있으므로, `memberService.ts`가 이를 활용하는 방향으로 리팩토링할 수 있습니다.

이 요약 정보가 데이터베이스 구조를 이해하는 데 도움이 되기를 바랍니다. 