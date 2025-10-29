# DOC SHARE - Document Sharing Website

### 1. STRUCTURE

```
DocShareProject/
├── config/                 # Configuration files
│   ├── cloudinary.php   
│   ├── config.properties
│   └── Database.php
├── controllers/           # Backend controllers
│   ├── AlbumController.php
│   ├── AuthController.php
│   ├── BookmarkController.php
│   ├── CategoryController.php
│   ├── CommentController.php 
│   └── ...
├── database/             # Database related files
│   ├── migrations/
│   └── seeds/
├── models/              # Backend models
├── public/             # Public assets
│   ├── js/
│   ├── upload.php
│   └── index.php
├── services/          # Backend services
├── template/         # HTML templates
├── utils/           # Utility functions
├── vendor/         # Dependencies
├── views/          # Frontend views
│   └── my-app/    # React application
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── services/
│       │   └── routes/
│       └── package.json
└── composer.json
```

---

### 2. FEATURES

1. Authentication

* User registration and login
* Password recovery
* Role-based access control (Admin/User)

2. Document Management

* Upload PDF documents
* View document details
* Download documents
* Bookmark documents
* Create document collections/albums

3. Social Features

* Comment on documents
* Like/Dislike documents
* Follow other users
* User profiles
* Post hashtags

4. Admin Features

* User management
* Category management
* Content moderation
* Report handling

5. Search & Organization

* Search documents
* Category browsing
* Hashtag filtering
* Personal bookmarks
* Document collections

---


### 3. USAGE GUIDE

1. **Initial Setup**

```
# Install PHP dependencies
composer install

# Install frontend dependencies
cd views/my-app
npm install
```

2. **Configuration**

* Configure database connection in [Database.php](C:/Users/long1/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
* Set up Cloudinary credentials in [cloudinary.php](C:/Users/long1/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
* Configure other settings in [config.properties](C:/Users/long1/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)

3. **Running the Application**

```
# Start PHP server (from project root)
php -S localhost:3000 -t public

# Start React development server
cd views/my-app
npm run dev
```

4. **Using the Application**

* Register an account or login
* Upload PDF documents through "New Post" button
* Browse documents by categories or hashtags
* Interact with documents (like, comment, bookmark)
* Manage your profile and document collections
* Access admin panel if you have admin privileges

5. **Development**

* Backend code is in PHP following MVC pattern
* Frontend is built with React + Vite
* API endpoints are defined in [index.php](C:/Users/long1/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)
* Frontend services communicate with backend through fetch API

Note: Make sure you have PHP 7.4+, MySQL, and Node.js 14+ installed before running the application.

---
