# remult-react-admin

remult-react-admin is a library that facilitates the use of `react-admin` by leveraging `remult`'s entities metadata.

## Install react admin
```sh
npm i react-admin remult-react-admin
```

## Usage
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

For more info, see [react-admin](https://marmelab.com/react-admin/)

## Reference
### RemultReactAdminDataProvider class, 
implements the `react-admin` dataProvider interface. 
You can send it one or more repositories, that will be used as the data source for `react-admin`

### raBuilder class
serves as a builder for react admin components
#### Members
* buildResource - builds a complete resources component with list, edit etc...
* buildEdit - builds a edit component
* buildCreate - builds a create component
* buildFilter - builds a filter component
* controls - a map, that maps between a `FieldMetadata` to it's matching control info, based on it's data type
