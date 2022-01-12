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


import { PLATFORM, FrameworkConfiguration}from "aurelia-framework";

export function configure(aurelia) {
	aurelia.globalResources(PLATFORM.moduleName('./itemcounter'));
	aurelia.globalResources(PLATFORM.moduleName('./index-format'));
	aurelia.globalResources(PLATFORM.moduleName('./date-format'));
	aurelia.globalResources(PLATFORM.moduleName('./text-trim'));
	aurelia.globalResources(PLATFORM.moduleName('./plural-format'));
	aurelia.globalResources(PLATFORM.moduleName('./campaign-trim'));
	aurelia.globalResources(PLATFORM.moduleName('./iterate-object'));
}
