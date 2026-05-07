import StreamingTargetPlugin from "./plugins/StreamingTargetPlugin.mjs";
import NodeFederationPlugin from "./plugins/NodeFederationPlugin.mjs";
import UniversalFederationPlugin from "./plugins/UniversalFederationPlugin.mjs";
import ChunkCorrelationPlugin from "./plugins/ChunkCorrelationPlugin.mjs";
import AutoPublicPathRuntimeModule from "./plugins/RemotePublicPathRuntimeModule.mjs";
import EntryChunkTrackerPlugin from "./plugins/EntryChunkTrackerPlugin.mjs";
import UniverseEntryChunkTrackerPlugin from "./plugins/UniverseEntryChunkTrackerPlugin.mjs";
export { ChunkCorrelationPlugin, EntryChunkTrackerPlugin, NodeFederationPlugin, AutoPublicPathRuntimeModule as RemotePublicPathPlugin, StreamingTargetPlugin, UniversalFederationPlugin, UniverseEntryChunkTrackerPlugin };