import React, { Component, PureComponent } from "react";
import ReactDOM from "react-dom";
import "@atlaskit/css-reset";
import styled from "styled-components";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import initialData from "./initialData";
import Column from "./Column";

const Container = styled.div`
  display: flex;
`;

class InnerList extends PureComponent {
  render() {
    const { column, taskMap, index } = this.props;
    const tasks = column.taskIds.map(taskId => taskMap[taskId]);

    return <Column column={column} tasks={tasks} index={index} />;
  }
}

class App extends Component {
  state = initialData;

  onDragStart = (start, provided) => {
    provided.announce(
      `You have lifted the task in position ${start.source.index + 1}`
    );
  };

  onDragUpdate = (update, provided) => {
    const message = update.destination
      ? `You have moved the task to position ${update.destination.index + 1}`
      : "Currently you are not over a droppable area";

    provided.announce(message);
  };

  onDragEnd = (result, provided) => {
    const message = result.destination
      ? `You have moved the task from position ${result.source.index +
          1} to ${result.destination.index + 1}`
      : `The task has been returned to its starting position of ${result.source
          .index + 1}`;

    provided.announce(message);

    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "column") {
      const newColumnOrder = [...this.state.columnOrder];
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        columnOrder: newColumnOrder
      };

      this.setState(() => newState);

      return;
    }
    const home = this.state.columns[source.droppableId];
    const foreign = this.state.columns[destination.droppableId];

    if (home === foreign) {
      const newTaskIds = [...home.taskIds];

      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...home,
        taskIds: newTaskIds
      };

      const newState = {
        ...this.state,
        columns: {
          ...this.state.columns,
          [newColumn.id]: newColumn
        }
      };

      this.setState(() => newState);

      return;
    }

    const homeTaskIds = [...home.taskIds];
    homeTaskIds.splice(source.index, 1);

    const newHome = {
      ...home,
      taskIds: homeTaskIds
    };

    const foreignTaskIds = [...foreign.taskIds];
    foreignTaskIds.splice(destination.index, 0, draggableId);

    const newForeign = {
      ...foreign,
      taskIds: foreignTaskIds
    };

    const newState = {
      ...this.state,
      columns: {
        ...this.state.columns,
        [newHome.id]: newHome,
        [newForeign.id]: newForeign
      }
    };

    this.setState(() => newState);
  };

  render() {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId="all-columns"
          direction="horizontal"
          type="column"
        >
          {provided => (
            <Container
              innerRef={provided.innerRef}
              {...provided.droppableProps}
            >
              {this.state.columnOrder.map((columnId, index) => {
                const column = this.state.columns[columnId];

                return (
                  <InnerList
                    key={column.id}
                    column={column}
                    taskMap={this.state.tasks}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
