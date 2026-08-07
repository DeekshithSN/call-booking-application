## Docker Commands 

### command to start mongo db 

```
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=secret -e MONGO_INITDB_DATABASE=my_db mongo
```

### Commands to build and run user-api 

inside user-api folder 

```
docker build -t user-api .
``` 

```
docker run -d -p 1004:1004 -e MONGO_URL="mongodb://user:password@machine-ip:port/?retryWrites=true&w=majority" -e ADMIN_EMAIL="admin@deekshithsn.co.in" user-api 
```

### Commands to build and run admin-api 

inside admin-api folder 

```
docker build -t admin-api .
``` 

```
docker run -d -p 1005:1004 -e MONGO_URL="mongodb://user:password@machine-ip:port/?retryWrites=true&w=majority" admin-api 
```

### Commands to build and run user-ui 

inside user-ui folder 

```
docker build -t user-ui .
``` 

```
docker run -d -p 3000:3000 user-ui 
```

### Commands to build and run admin-ui 

inside admin-ui folder 

```
docker build -t admin-ui .
``` 

```
docker run -d -p 3000:3000 admin-ui 
```