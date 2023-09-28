# Node Server (TypeScript)

This Server is created with Typescript, Node, Express, Passport & Mongo DB.

## Getting Started

First, run the development server:

```bash
npm run dev
# for the dev build
npm run build
# for the production build
npm run start
# to start the production build
```

The Server runs on port 5000. Open [http://localhost:5000](http://localhost:5000) with your browser to see the result. The server should respond with {"status":"success"}.

___
___
## AUTH ROUTES
```
/api/auth
```
___
___
### POST /signup
```ts
{
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, email, password }),
}

```
#### RESPONSES
Success 
```ts
{
  success: boolean;
  token: string;
  details: UserInterface;
  notebookID: ObjectId;
  noteID: ObjectId;
}
```
UserInterface[^1]

Error
```ts
{ error: string }
```
___
### POST /login
```ts

{
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  token: string,
  details: UserInterface
 }
```
UserInterface[^1]

Error 
```ts
{ error: string }
```
___
### GET /logout 
```ts
{
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}
```
##### RESPONSES
Success
```ts
{ success: true } 
```
Error
```ts
{error: string}
```
___
### GET /refreshtoken
```ts
{
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  }
}
```

#### RESPONSES
Success 
```ts
{ 
  success: true,
  token: string,
  details: UserInterface
 }
```
UserInterface[^1]

Error
```ts
{error: string}
```
___
### POST /change-username
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({newUsername: enteredNewUsername}),
}
```

#### RESPONSES
Success 
```ts
{ 
  success: true,
  details: UserInterface
}
```
UserInterface[^1]

Error
```ts
{ error: string }
```
___
### PATCH /change-password
```ts
{
  method: "PATCH",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ oldPassword, newPassword }),
}
```
#### RESPONSES
Success 
```ts
{ success: true }
```
Error
```ts
{ error: string }
```
___
## NOTE ROUTES
```
/api/data
```
___
___

### GET /notebooks
```ts
{
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }, 
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  notebooks: {[
    {
      _id: string;
      notebook_name: string;
      notebook_cover: string;
      createdAt: TDateISO | "No date";
      updatedAt: TDateISO | "No date";
    }
  ]}
}
```
Error
```ts
{ error: string }
```
___

### GET /notebook/\:notebookId
```ts
{
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
  }, 
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  notebook: {
    _id: string;
    notebook_name: string;
    notebook_cover: string;
    createdAt: TDateISO | "No date";
    updatedAt: TDateISO | "No date";
  }
}
```
Error
```ts
{ error: string }
```
___

### GET /notes/\:notebookId
```ts
{
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }, 
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  notes: {[
    {
      _id: string;
      note: string;
      notebook: string;
      createdAt: ISODateString;
      updatedAt: ISODateString;
    }
  ]}
}
```
Error
```ts
{ error: string }
```
___

### GET /notebook/\:notebookId/\:noteId
```ts
{
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
  }, 
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  note: {
    _id: string;
    note: string;
    notebook: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /create-note
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
    notebookId: string, 
    note: string 
  }),
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  note: {
    acknowledged: boolean,
    insertedId: string;
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /addnotebook
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
      notebookName: string,
      notebookCover: string,
  }),
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  notebook: {
    _id: string;
    notebook_name: string;
    notebook_cover: string;
    createdAt: TDateISO | "No date";
    updatedAt: TDateISO | "No date";
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /delete-notes
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
      note_ids: string[]
  }),
}
```
#### RESPONSES
Success 
```ts
{ 
  success: true,
  notes_deleted: {
    acknowledged: boolean,
    deletedCount: number
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /edit-notebook-date
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
    notebookID: string,
    notebookUpdated: string
  }),
}
```
#### RESPONSES
Success 
```ts
{
  success: true,
  notebook_date_updated: {
    _id: ObjectId;
    updatedAt: Date;
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /move-notes
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
    notes: string[],
    notebookID: string,
    latestUpdatedNote: string,
  }),
}
```
#### RESPONSES
Success 
```ts
{
  success: boolean,
  notes_moved: string[],
  server_response: {
    "insertedCount": number,
    "matchedCount": number,
    "modifiedCount": number,
    "deletedCount": number,
    "upsertedCount": number,
    "upsertedIds": {},
    "insertedIds": {}
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /delete-notebook
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
    notebookID: string
  }),
}
```
#### RESPONSES
Success 
```ts
{
  success: boolean,
  notebook_deleted: ObjectId,
  server_response: {
    acknowledged: boolean,
    matchedCount: number,
    modifiedCount: number,
    upsertedCount: number,
    upsertedId: ObjectId | null,
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /edit-notebook
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
    notebookID: string,
    notebookName: string,
    notebookCover: string,
    notebookUpdated: string,
  }),
}
```
#### RESPONSES
Success 
```ts
{
  success: boolean,
  notebook_edited: {
    _id: string,
    notebook_name: string,
    notebook_cover: "default" | "red" | "green" | "blue"
  }
}
```
Error
```ts
{ error: string }
```
___

### POST /save-note
```ts
{
  method: "POST",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ 
    notebookID: string,
    noteID: string,
    note: string,
  }),
}
```
#### RESPONSES
Success 
```ts
{
  success: boolean,
  server_response: {
    acknowledged: boolean,
    matchedCount: number,
    modifiedCount: number,
    upsertedCount: number,
    upsertedId: ObjectId | null,
  }
}
```
Error
```ts
{ error: string }
```
___
___

## About

This is a note taking app. The notes can be written using [Markdown](https://www.markdownguide.org/).

# Folders

Folders can be created for organising the Notes. The name and colour of these Folders can be updated. Empty Folders can be deleted. The Notes within a Folder can be moved to other Folders.
To create a Folder select the **Add Notebook** button on the Notebooks page. An "Add Folder" dialogue box will appear. Add the Notebook name and colour and select the **Add Notebook** button to create the new Folder.

# Notes

To create a new Note select the Notebook where that Note will be stored and then select the **Add Note** button. An empty Note will be created within the current Folder. Enter Markdown into the empty Note and then select the **Create Note** button.

By default the notes are displayed as rendered Markdown. The notes can be edited by selecting the **Edit** button which will display the unrendered Markdown. Selecting the **View** button will display the rendered Markdown.

To move a Note or Notes from a Folder select the **Edit Notes** button. All the Notes within that folder will become selectable. Select those Notes which you want to move and then select the **Move** button. A dialogue box will appear with a dropdown list showing all available Notebooks. Select the destination Notebook and then select the **Move Note/s** button.



[^1]: UserInterface
    ```ts
    interface UserInterface extends Document {
      username: string;
      email: string;
      authStrategy: {
        type: string;
        default: "local";
      };
      _id: string;
      refreshToken: RefreshTokenInterface[];
      changePassword(
        oldPassword: string,
        newPassword: string
      ): Promise<PassportLocalDocument>;
    }
    ```
