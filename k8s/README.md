# Kubernetes 배포 가이드

## 환경별 설정 파일

- **로컬/테스트**: `.env` - 로컬 k3s 테스트 환경용
- **프로덕션**: `.env.production` - 프로덕션 배포용 (CloudNativePG 데이터베이스 포함)

## 사전 준비

### 1. 데이터베이스 설정 (프로덕션 첫 배포 시 필수)

CloudNativePG Operator가 설치되어 있는지 확인:

```bash
kubectl get pods -n cnpg-system
```

데이터베이스 클러스터 생성:

```bash
kubectl apply -f k8s/database.yaml
```

데이터베이스가 준비될 때까지 대기 (수 분 소요 가능):

```bash
kubectl get cluster -n apps
# 모든 인스턴스가 Ready 상태가 될 때까지 대기
```

### 2. Secret 생성

**프로덕션 배포:**

프로젝트 루트의 `.env.production` 파일을 사용하여 Kubernetes Secret을 생성합니다:

```bash
kubectl create secret generic ssemtle-env \
  --from-env-file=.env.production \
  --namespace=apps
```

Secret이 이미 존재하는 경우 업데이트:

```bash
kubectl delete secret ssemtle-env --namespace=apps
kubectl create secret generic ssemtle-env \
  --from-env-file=.env.production \
  --namespace=apps
```

**로컬/테스트 배포:**

로컬 테스트 환경에서는 `.env` 파일 사용:

```bash
kubectl create secret generic ssemtle-env \
  --from-env-file=.env \
  --namespace=apps
```

### 3. 매니페스트 적용

```bash
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/deployment.yaml
```

### 4. 배포 상태 확인

```bash
kubectl -n apps rollout status deploy/ssemtle
kubectl -n apps get pods -l app=ssemtle
```

## CI/CD 자동 배포

GitHub Actions 워크플로우는 `main` 브랜치에 push 시 자동으로:

- Docker 이미지 빌드 및 GHCR에 푸시
- k8s 매니페스트 적용 (service.yaml, ingress.yaml, deployment.yaml)

**주의:** CI/CD는 database.yaml과 secret을 자동으로 생성하지 않습니다.
첫 배포 전 위의 "사전 준비" 단계를 수동으로 완료해야 합니다.

## 주의사항

- `.env` 및 `.env.production` 파일에는 민감한 정보가 포함되어 있으므로 절대 커밋하지 마세요 (gitignore 처리됨)
- `deployment.yaml`의 이미지 태그는 CI/CD에서 자동으로 교체됩니다
- 데이터베이스 마이그레이션은 initContainer에서 자동으로 실행됩니다
- 프로덕션 배포 시 반드시 `.env.production` 파일을 사용하여 secret을 생성하세요
