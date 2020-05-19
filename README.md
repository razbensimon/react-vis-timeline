React vis-timeline component
=====================

React component for the `vis-timeline` timeline module.

[vis-timeline documentation](https://visjs.github.io/vis-timeline/docs/timeline/)

## Installation

```
npm install --save react-vis-timeline
```

OR

```
yarn add react-vis-timeline
```

## Getting Started

```typescript
import Timeline from 'react-vis-timeline'

// https://visjs.github.io/vis-timeline/docs/timeline/#Configuration_Options

const options = {
  width: '100%',
  height: '100px',
  // ...
  // ...
}

// JSX
<Timeline options={options} />
```


## What are the differences from `react-visjs-timeline` ?

* Written in Typescript
* Using `vis-timeline` library! without the  old `vis.js`
* No unnecessary re-renders

  The old lib caused re-renders on each prop changed, and using immutable objects to detect changes.
  This was very problematic and caused performance issues.
  We don't wont to re-render the whole timeline, just because 1 item added to the items array.
  
* API changes (items, groups)

  vis-timeline already knows how to detect changes with `vis-data`'s DataSet object.
  So in this library, we take it as an advantage and using these DataSets.
  While exposing them to the user within `ref`.
  
  You can also insert initial data with props, and update/add/remove later with ref API.
  
* Expose the timeline's API.

  Methods like `focus`, `fit`, and many more native vis-timeline methods exposed as well in optional `ref`.


## Supported Features

* Configuration Options
* Items
* Groups
* Custom Times
* Events
* Selection
* Timeline's API

## Items

Items follow the exact same for format as they do in `vis-timeline``. See the [vis-timeline documentation](https://visjs.github.io/vis-timeline/docs/timeline/#items) for more information.

```typescript
const items = [{
  start: new Date(2010, 7, 15),
  end: new Date(2010, 8, 2),  // end is optional
  content: 'Trajectory A',
}]

<Timeline
  options={options}
  initialItems={items}
/>
```

## Groups

Groups follow the exact same for format as they do in vis-timeline. See the [vis-timeline documentation](https://visjs.github.io/vis-timeline/docs/timeline/#groups) for more information.

```typescript
const groups = [{
  id: 1,
  content: 'Group A',
}]

<Timeline
  options={options}
  initialGroups={groups}
/>
```

## Custom Times

CustomTimes defined more declaratively in the component, via the `customTimes` prop.

```typescript
const customTimes = [
  {
    id: 'one',
    datetime: new Date()
  },
  {
    id: 'two',
    datetime: 'Tue May 10 2016 16:17:44 GMT+1000 (AEST)'
  }
]
```

When the `customTimes` prop changes, the updated times will be reflected in the timeline.

## Events

All events are supported via prop function handlers. The prop name follows the convention `<eventName>Handler` and the specified function will receive the same arguments as the [vis-timeline counterparts](https://visjs.github.io/vis-timeline/docs/timeline/#Events).
Some vis-timeline event names are not camelcased (e.g. `rangechange`), so the corresponding React prop names need to follow that convention where necessary:

```typescript
<Timeline
  options={options}
  clickHandler={clickHandler}
  rangechangeHandler={rangeChangeHandler}
/>

function clickHandler(props) {
  // handle click event
}

function rangeChangeHandler(props) {
  // handle range change
}
```

## Animation

You can enable animation (when the options start/end values change) by passing a prop of `animation` to the component. The available options for this prop follow the same conventions as `setWindow` in `vis-timeline`. So you can either pass a boolean value (`true` by default) or an object specifying your animation configuration, e.g:

```typescript
// animate prop...
{
  duration: 3000,
  easingFunction: 'easeInQuint'
}
```

## Styling

Import your custom CSS *after* you import the component from the module, e.g:

```typescript
import Timeline from 'react-vis-timeline';
import './my-custom-css.css';
```
