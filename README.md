# CRUD API
This is an API that works on top of HackerNews and allows user to maintain custom collections of stories.
Offers basic fulltext search functionality via ElasticSearch.
API is secured via JWT tokens.
## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

1. Install [Node.js version 14 or greater] (https://nodejs.org/en/download/)
2. Install Docker and docker-compose
3. Clone this repository:
```
git clone https://github.com/Dratinox/hacker-news-stories.git
```

### How to run a sample

1. Run the sample:

```
docker-compose up -d
```

2. Test the application:

```
npm install

npm run test
```

### Guide
Every route here is under /api

Store token from registering / logging in as "x-auth-token" header

1. Create a user

```
POST /user
@param username: string
@param password: string
@return token: string
```
2. Login user

```
POST /auth
@param username: string
@param password: string
@return token: string
```

3. Add story to collection (creates a collection if it doesn't exist)

```
POST /collection
@param id: number (story ID)
@param name: string
```
4. Retrive collections / collection

```
GET /collection[/:id]
```
5. Update collection

```
PUT /collection/:id
```

6. Delete collection

```
DELETE /collection/:id
```

7. Fulltext search through collections

```
POST /search
@param term: string
@param (optional) collectionId: number
```
