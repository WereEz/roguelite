import {IRoomGraphNode} from './IRoomGraphNode';
import {IRoomGraphConnection} from './IRoomGraphConnection';

export interface IDungeonGraph {
    nodes: IRoomGraphNode[];
    connections: IRoomGraphConnection[];
}