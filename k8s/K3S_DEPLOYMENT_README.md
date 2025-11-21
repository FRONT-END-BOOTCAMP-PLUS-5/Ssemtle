# Kubernetes 배포 가이드

## 환경별 설정 파일

- **로컬/테스트**: `.env` - 로컬 k3s 테스트 환경용
- **프로덕션**: `.env.production` - 프로덕션 배포용 (CloudNativePG 데이터베이스 포함)

## 사전 준비 (호스트 서버에서 또는 원격 연결을 통해서!)

### 0. K3S 설치 확인

K3S가 설치되어 있는지 확인:

```bash
sudo k3s kubectl get node
```

없다면 설치 및 설치 상태 확인:

```bash
curl -sfL https://get.k3s.io | sh -
# Check for Ready node, takes ~30 seconds
sudo k3s kubectl get node
```

### 1. 데이터베이스 설정 (프로덕션 첫 배포 시 필수)

CloudNativePG Operator가 설치되어 있는지 확인:

```bash
kubectl get pods -n cnpg-system
```

`database.yaml` 수정 (이전 DB에 대한 적절한 값 채워주기)

데이터베이스 클러스터 생성:

```bash
kubectl apply -f k8s/database.yaml
```

데이터베이스가 준비될 때까지 대기 (수 분 소요 가능):

```bash
kubectl get cluster -n apps
# 모든 인스턴스가 Ready 상태가 될 때까지 대기
```

데이터베이스 비밀번호 조회:

```bash
kubectl get secret ssemtle-db-app -n apps -o jsonpath='{.data.password}' | base64 -d
```

여기서 나온 값으로 `.env.production` 수정:

```bash
DATABASE_URL="postgresql://ssemtle_user:[비밀번호]@ssemtle-db-rw.apps.svc.cluster.local:5432/ssemtle?schema=public"
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

## CI/CD 자동 배포

GitHub Actions 워크플로우는 `main` 브랜치에 push 시 자동으로:

- Docker 이미지 빌드 및 DockerHUB에 푸시
- Helm Chart 적용 (heml/ssemtle/)

**주의:** CI/CD는 database.yaml과 secret을 자동으로 생성하지 않습니다.
첫 배포 전 위의 "사전 준비" 단계를 수동으로 완료해야 합니다.

## 주의사항

- `.env` 및 `.env.production` 파일에는 민감한 정보가 포함되어 있으므로 절대 커밋하지 마세요 (gitignore 처리됨)
- 프로덕션 배포 시 반드시 `.env.production` 파일을 사용하여 secret을 생성하세요
