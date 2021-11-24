# remult-react-admin

remult-react-admin is a library that facilitates the use of `react-admin` by leveraging `remult`'s entities metadata.

## Install react admin
```sh
npm i react-admin remult-react-admin
```

## Usage in code
```ts
import { Admin } from "react-admin";
import { raBuilder, RemultReactAdminDataProvider } from "remult-react-admin";
import { remult } from "./common";
import { Task } from './Task';

const taskRepo = remult.repo(Task);
const dataProvider = new RemultReactAdminDataProvider(taskRepo);

function App() {

  return (
    <Admin dataProvider={dataProvider}>
      {new raBuilder(taskRepo).buildResource()}

    </Admin>
  );
}

export default App;
```