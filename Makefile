login:
	firebase login

init:
	firebase init

deploy-public:
	firebase deploy --only hosting:mes-recettes-personnelles

deploy: deploy-public