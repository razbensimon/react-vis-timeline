import React, { Component } from 'react';
import { DataSet } from 'vis-data';
import { Timeline as VisTimelineCtor } from 'vis-timeline/esnext';
import type {
	DateType,
	IdType,
	Timeline as VisTimeline,
	TimelineAnimationOptions,
	TimelineGroup,
	TimelineItem,
	TimelineOptions
} from 'vis-timeline/types';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

import _difference from 'lodash/difference';
import _intersection from 'lodash/intersection';
import _each from 'lodash/each';
import _assign from 'lodash/assign';
import _omit from 'lodash/omit';
import _keys from 'lodash/keys';
import type { CustomTime, SelectionOptions, TimelineEventsHandlers, TimelineEventsWithMissing } from './models';

const noop = function () {};

const events: TimelineEventsWithMissing[] = [
	'currentTimeTick',
	'click',
	'contextmenu',
	'doubleClick',
	'dragover',
	'drop',
	'mouseOver',
	'mouseDown',
	'mouseUp',
	'mouseMove',
	'groupDragged',
	'changed',
	'rangechange',
	'rangechanged',
	'select',
	'itemover',
	'itemout',
	'timechange',
	'timechanged',
	'markerchange',
	'markerchanged'
];

const eventDefaultProps: TimelineEventsHandlers = {};
_each(events, event => {
	eventDefaultProps[`${event}Handler`] = noop;
});

type Props = {
	initialItems?: TimelineItem[];
	initialGroups?: TimelineGroup[];
	options?: TimelineOptions;
	selection?: IdType[];
	customTimes?: CustomTime[];
	selectionOptions?: SelectionOptions;
	animate?: boolean | {};
	currentTime?: DateType;
} & TimelineEventsHandlers;

export default class Timeline extends Component<Props, {}> {
	static defaultProps = _assign(
		{
			initialItems: [],
			groups: [],
			options: {},
			selection: [],
			customTimes: []
		},
		eventDefaultProps
	);

	public timeline: VisTimeline;
	public readonly items: DataSet<TimelineItem>;
	public readonly groups: DataSet<TimelineGroup>;

	#ref = React.createRef<HTMLDivElement>();

	constructor(props: Props) {
		super(props);

		Object.defineProperty(this, 'items', {
			value: new DataSet<TimelineItem>(),
			writable: false
		});

		Object.defineProperty(this, 'groups', {
			value: new DataSet<TimelineGroup>(),
			writable: false
		});
	}

	componentWillUnmount() {
		this.timeline.destroy();
	}

	componentDidMount() {
		this.timeline = new VisTimelineCtor(this.#ref.current, this.items, this.groups, this.props.options);

		for (const event of events) {
			const eventHandler = this.props[`${event}Handler`];
			if (eventHandler !== noop) {
				this.timeline.on(event, eventHandler);
			}
		}

		this.init();
	}

	shouldComponentUpdate(nextProps: Props) {
		const { initialItems, initialGroups, options, selection, customTimes, currentTime } = this.props;

		const itemsChange = initialItems !== nextProps.initialItems;
		const groupsChange = initialGroups !== nextProps.initialGroups;
		const optionsChange = options !== nextProps.options;
		const customTimesChange = customTimes !== nextProps.customTimes;
		const selectionChange = selection !== nextProps.selection;
		const currentTimeChange = currentTime !== nextProps.currentTime;

		if (groupsChange) {
			console.warn(
				"react-vis-timeline: you are trying to change 'initialGroups' prop. Please use the public api exposed with in ref"
			);
		}

		if (itemsChange) {
			console.warn(
				"react-vis-timeline: you are trying to change 'initialItems' prop. Please use the public api exposed with in ref"
			);
		}

		if (optionsChange) {
			this.timeline.setOptions(nextProps.options);
		}

		if (customTimesChange) {
			this.updateCustomTimes(customTimes, nextProps.customTimes);
		}

		if (selectionChange) {
			this.updateSelection(nextProps.selection, nextProps.selectionOptions);
		}

		if (currentTimeChange) {
			this.timeline.setCurrentTime(nextProps.currentTime);
		}

		return false;
	}

	updateCustomTimes(prevCustomTimes: CustomTime[], customTimes: CustomTime[]) {
		// diff the custom times to decipher new, removing, updating
		const customTimeKeysPrev = _keys(prevCustomTimes);
		const customTimeKeysNew = _keys(customTimes);
		const customTimeKeysToAdd = _difference(customTimeKeysNew, customTimeKeysPrev);
		const customTimeKeysToRemove = _difference(customTimeKeysPrev, customTimeKeysNew);
		const customTimeKeysToUpdate = _intersection(customTimeKeysPrev, customTimeKeysNew);

		_each(customTimeKeysToRemove, id => this.timeline.removeCustomTime(id));
		_each(customTimeKeysToAdd, id => {
			const datetime = customTimes[id].datetime;
			this.timeline.addCustomTime(datetime, id);
		});
		_each(customTimeKeysToUpdate, id => {
			const datetime = customTimes[id].datetime;
			this.timeline.setCustomTime(datetime, id);
		});
	}

	updateSelection(selection: IdType | IdType[], selectionOptions: SelectionOptions): void {
		this.timeline.setSelection(selection, selectionOptions as Required<SelectionOptions>);
	}

	init() {
		const {
			initialItems,
			initialGroups,
			options,
			selection,
			selectionOptions = {},
			customTimes,
			animate = true,
			currentTime
		} = this.props;

		let timelineOptions = options;

		if (animate) {
			// If animate option is set, we should animate the timeline to any new
			// start/end values instead of jumping straight to them
			timelineOptions = _omit(options, 'start', 'end');

			this.timeline.setWindow(options.start, options.end, {
				animation: animate
			} as TimelineAnimationOptions);
		}

		this.timeline.setOptions(timelineOptions);

		if (initialGroups.length > 0) {
			this.groups.add(initialGroups);
		}

		if (initialItems.length > 0) {
			this.items.add(initialItems);
		}

		this.updateSelection(selection, selectionOptions);

		if (currentTime) {
			this.timeline.setCurrentTime(currentTime);
		}

		this.updateCustomTimes([], customTimes);
	}

	render() {
		return <div ref={this.#ref} />;
	}
}
