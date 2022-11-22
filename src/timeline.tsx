import React, { Component } from 'react';
import { difference, intersection, each, omit, keys } from 'lodash';
import type { CustomTime, SelectionOptions, TimelineEventsHandlers, TimelineEventsWithMissing } from './models';
import { DateType, IdType, Timeline as VisTimeline, TimelineGroup, TimelineItem, TimelineOptions } from 'vis-timeline';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

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

export class Timeline extends Component<Props, {}> {
	public timeline: VisTimeline | null = null;

	#ref = React.createRef<HTMLDivElement>();

	override componentWillUnmount() {
		this.timeline?.destroy();
	}

	override componentDidMount() {
		this.timeline = new VisTimeline(
			this.#ref.current,
			this.props.initialItems,
			this.props.initialGroups,
			this.props.options
		);
		for (const event of events) {
			const eventHandler = this.props[`${event}Handler`];
			if (typeof eventHandler === 'function') {
				this.timeline.on(event, eventHandler as (properties: any) => void);
			}
		}

		const { options, selection, selectionOptions = {}, customTimes, animate = true, currentTime } = this.props;

		let timelineOptions = options;

		if (animate) {
			// If animate option is set, we should animate the timeline to any new
			// start/end values instead of jumping straight to them
			timelineOptions = omit(options, 'start', 'end');

			this.timeline.setWindow(options.start, options.end, {
				animation: animate
			});
		}

		this.timeline.setOptions(timelineOptions);
		this.updateSelection(selection, selectionOptions);

		if (currentTime) {
			this.timeline.setCurrentTime(currentTime);
		}

		this.updateCustomTimes([], customTimes);
	}

	override shouldComponentUpdate(nextProps: Props) {
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

		if (this.timeline) {
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
		}
		return false;
	}

	private updateCustomTimes(prevCustomTimes: CustomTime[], customTimes: CustomTime[]) {
		// diff the custom times to decipher new, removing, updating
		const customTimeKeysPrev = keys(prevCustomTimes);
		const customTimeKeysNew = keys(customTimes);
		const customTimeKeysToAdd = difference(customTimeKeysNew, customTimeKeysPrev);
		const customTimeKeysToRemove = difference(customTimeKeysPrev, customTimeKeysNew);
		const customTimeKeysToUpdate = intersection(customTimeKeysPrev, customTimeKeysNew);
		each(customTimeKeysToRemove, id => this.timeline.removeCustomTime(id));
		each(customTimeKeysToAdd, id => {
			const datetime = customTimes[id].datetime;
			this.timeline.addCustomTime(datetime, id);
		});
		each(customTimeKeysToUpdate, id => {
			const datetime = customTimes[id].datetime;
			this.timeline.setCustomTime(datetime, id);
		});
	}

	private updateSelection(selection: IdType | IdType[], selectionOptions: SelectionOptions): void {
		this.timeline.setSelection(selection, selectionOptions as Required<SelectionOptions>);
	}

	override render() {
		return <div ref={this.#ref} />;
	}
}
