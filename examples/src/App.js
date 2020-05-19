import React, { Component } from 'react';
import Timeline from 'react-vis-timeline';
import moment from 'moment';
import './App.css';

function createItem(id, groupId, name, startTime) {
	return {
		id: id,
		group: groupId,
		content: 'item ' + id + ' <span style="color:#97B0F8">(' + name + ')</span>',
		start: startTime,
		end: startTime.clone().add(1, 'hours'),
		type: 'box'
	};
}

const props = {
	initialGroups: [],
	initialItems: [],
	options: {
		height: '100%',
		autoResize: true,
		stack: true, // false == overlap items
		orientation: 'top',
		verticalScroll: true,
		zoomKey: 'ctrlKey'
	}
};

const now = moment().minutes(0).seconds(0).milliseconds(0);
const groupCount = 3;
const itemCount = 20;

// create a data set with groups
const names = ['John', 'Alston', 'Lee', 'Grant'];
for (let g = 0; g < groupCount; g++) {
	props.initialGroups.push({ id: g, content: names[g] });
}

// create a dataset with items
for (let i = 0; i < itemCount; i++) {
	const start = now.clone().add(Math.random() * 200, 'hours');
	const group = Math.floor(Math.random() * groupCount);
	props.initialItems.push(createItem(i, group, names[group], start));
}

class App extends Component {
	timelineRef = React.createRef();

	constructor(props) {
		super(props);

		this.state = {
			selectedIds: []
		};
	}

	onAddItem = () => {
		var nextId = this.timelineRef.current.items.length + 1;
		const group = Math.floor(Math.random() * groupCount);
		this.timelineRef.current.items.add(createItem(nextId, group, names[group], moment()));
		this.timelineRef.current.timeline.fit();
	};

	onFit = () => {
		this.timelineRef.current.timeline.fit();
	};

	render() {
		return (
			<div className="App">
				<p className="header">This example demonstrate using groups.</p>
				<div className="timeline-container">
					<Timeline
						ref={this.timelineRef}
						{...props}
						clickHandler={this.clickHandler}
						selection={this.state.selectedIds}
					/>
				</div>
				<br />
				<button onClick={this.onAddItem}>Add Item</button>
				<button onClick={this.onFit}>Fit Screen</button>
			</div>
		);
	}

	clickHandler = () => {
		const { group } = this.props;
		var items = this.timelineRef.current.items.get();
		const selectedIds = items.filter(item => item.group === group).map(item => item.id);
		this.setState({
			selectedIds
		});
	};
}

export default App;
