/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


export class Notification {

	constructor(data) {
		this.id = data.dbId;
		this.activity = data.activity;
		this.receiver = data.receiver;
		this.sender = data.sender;
		this.pendingResponse = data.pendingResponse;
		this.openedAt = data.openedAt;
		this.resource = data.resource;
		this.shareInfo = {
			userOrGroup: {
				timestamp: data.timestamp,
				machineIdentifier: data.machineIdentifier,
				processIdentifier: data.processIdentifier,
				counter: data.counter,
				date: data.date,
				time: data.time,
				timeSecond: data.timeSecond
			},
			previousAccess: data.previousAccess,
			newAccess: data.newAccess,
			ownerEffectiveIds: data.ownerEffectiveIds,
			userOrGroupName: data.userOrGroupName
		};
		this.resourceName = data.resourceName;
		this.senderName = data.senderName;
		this.message = data.message;
	}

	get image() {
		// TODO: Change the call to return the square image of the sender, and the placeholder below only if no image was found
		return '/img/assets/img/images/user.png';
	}

}
