# Kubernetes 배포 가이드

## 사전 준비

### 1. Secret 생성

프로젝트 루트의 `.env` 파일을 사용하여 Kubernetes Secret을 생성합니다:

```bash
kubectl create secret generic ssemtle-env \
  --from-env-file=.env \
  --namespace=apps
```

Secret이 이미 존재하는 경우 업데이트:

```bash
kubectl delete secret ssemtle-env --namespace=apps
kubectl create secret generic ssemtle-env \
  --from-env-file=.env \
  --namespace=apps
```

### 2. 매니페스트 적용

```bash
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/deployment.yaml
```

### 3. 배포 상태 확인

```bash
kubectl -n apps rollout status deploy/ssemtle
kubectl -n apps get pods -l app=ssemtle
```

## 주의사항

- `.env` 파일에는 민감한 정보가 포함되어 있으므로 절대 커밋하지 마세요
- `deployment.yaml`의 이미지 태그는 CI/CD에서 자동으로 교체됩니다
- 데이터베이스 마이그레이션은 initContainer에서 자동으로 실행됩니다
