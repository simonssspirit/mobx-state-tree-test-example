import './App.css';
import '@progress/kendo-theme-default/dist/all.css';

import { Observer } from 'mobx-react'
import React from 'react';
import { TreeView } from '@progress/kendo-react-treeview';
import { types } from "mobx-state-tree"

const Directory = types
  .model("directory", {
    name: types.string,
    expanded: types.boolean,
    // items: types.frozen() // it is array of type Directory
    items: types.array(types.late(() => Directory))
  }).actions(self => ({
    addItem(itemSnapshot) {
      self.items.push(itemSnapshot)
    }
  }))



const Store = types.model("Store", {
  directories: types.optional(types.array(Directory), [])
}).actions(self => ({
  addItem(itemSnapshot) {
    self.directories.push(itemSnapshot)
  }
}))

// create an instance from a snapshot
const store = Store.create({
  directories: [
    {
      name: 'USA',
      expanded: true,
      items: [
        {
          name: 'new york',
          expanded: true,
          items: [
            {
              name: 'Boston',
              expanded: true,
              items: [],
            }
          ],
        }
      ],
    },
  ]
})


function App() {
  const [test, setTest] = React.useState('test');
  // add item to the root of the treeview
  const addItem = () => {
    store.addItem({
      name: `Root Item ${Date.now()}`,
      expanded: true,
    })
  }
  // add sub item to one of the root item
  const addSubItemUSA = () => {
    // for sample purpose we take the first be it can be anyone
    store.directories[0].addItem({
      name: `Sub Item ${Date.now()}`,
      expanded: true,
    })
  }
  // add sub item to one of the root item
  const addSubItemNY = () => {
    // for sample purpose we take the first be it can be anyone
    store.directories[0].items[0].addItem({
      name: `Sub Item ${Date.now()}`,
      expanded: true,
    })
  }

  const myItemRender = (props) => {
    return (<Observer key={props.itemHierarchicalIndex}>
      {() => {
        return <span>{props.item.name}</span>
      }}
    </Observer>
    )
  }
  return (
    <div className="App">
      <Observer>
        {() => {
          return <TreeView data={store.directories.slice()} textField="name" expandField="expanded" item={myItemRender} />
        }}
      </Observer>

      <button onClick={addItem}>add root item</button>
      <button onClick={addSubItemUSA}>add sub item USA</button>
      <button onClick={addSubItemNY}>add sub item New York</button>
      <Observer>
        {() => <MyTree {...store} />}
      </Observer>

    </div>
  );
}

const MyTree = store => {
  const { directories } = store;
  const renderSubMenu = (children) => {
    if (children && children.length > 0) {

      return (
        <Observer>
          {() => (
            <ul className="menu__submenu">{renderItems(children)}</ul>
          )}
        </Observer>
      );
    }
  };

  const renderItems = (items) => {
    return items.map((item, idx) => {
      const { name, items } = item;
      return (
        <Observer key={idx}>
          {() => (
            <li className="menu__item" key={idx}>
              {name}
              {renderSubMenu(items)}
            </li>
          )}
        </Observer>
      );
    });
  };

  return (<Observer >
    {() => (<ul style={{ textAlign: 'left' }}>{renderItems(directories)}</ul>)}
  </Observer>)
}

export default App;
