import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './node-content-renderer.scss';

function isDescendant(older, younger) {
  return (
    !!older.children &&
    typeof older.children !== 'function' &&
    older.children.some(
      child => child === younger || isDescendant(child, younger)
    )
  );
}

// eslint-disable-next-line react/prefer-stateless-function
class FileThemeNodeContentRenderer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    };
    this.onCheckHandler = this.onCheckHandler.bind(this);
  }
  onCheckHandler() {
    this.setState(
      state => ({
        checked: !state.checked,
      }),
      () => this.props.onCheck && this.props.onCheck(this.state.checked)
    );
  }

  render() {
    const {
      scaffoldBlockPxWidth,
      onCheck,
      toggleChildrenVisibility,
      connectDragPreview,
      connectDragSource,
      isDragging,
      canDrop,
      canDrag,
      node,
      title,
      draggedNode,
      path,
      treeIndex,
      isSearchMatch,
      isSearchFocus,
      icons,
      buttons,
      className,
      style,
      didDrop,
      lowerSiblingCounts,
      listIndex,
      swapFrom,
      swapLength,
      swapDepth,
      treeId, // Not needed, but preserved for other renderers
      isOver, // Not needed, but preserved for other renderers
      parentNode, // Needed for dndManager
      ...otherProps
    } = this.props;
    const nodeTitle = title || node.title;

    const isDraggedDescendant = draggedNode && isDescendant(draggedNode, node);
    const isLandingPadActive = !didDrop && isDragging;

    // Custom calculations for creating all labels the same right end stop
    const labelOffset = (toggleChildrenVisibility && node.children && node.children.length > 0)
      ? (scaffoldBlockPxWidth - 1) : 0;
    const labelWidth = 300 - (lowerSiblingCounts.length * scaffoldBlockPxWidth) - labelOffset;

    // Construct the scaffold representing the structure of the tree
    const scaffold = [];
    lowerSiblingCounts.forEach((lowerSiblingCount, i) => {
      scaffold.push(
        <div
          key={`pre_${1 + i}`}
          style={{ width: scaffoldBlockPxWidth }}
          className={styles.lineBlock}
        />
      );

      if (treeIndex !== listIndex && i === swapDepth) {
        // This row has been shifted, and is at the depth of
        // the line pointing to the new destination
        let highlightLineClass = '';

        if (listIndex === swapFrom + swapLength - 1) {
          // This block is on the bottom (target) line
          // This block points at the target block (where the row will go when released)
          highlightLineClass = styles.highlightBottomLeftCorner;
        } else if (treeIndex === swapFrom) {
          // This block is on the top (source) line
          highlightLineClass = styles.highlightTopLeftCorner;
        } else {
          // This block is between the bottom and top
          highlightLineClass = styles.highlightLineVertical;
        }

        scaffold.push(
          <div
            key={`highlight_${1 + i}`}
            style={{
              width: scaffoldBlockPxWidth,
              left: scaffoldBlockPxWidth * i,
            }}
            className={`${styles.absoluteLineBlock} ${highlightLineClass}`}
          />
        );
      }
    });
    
    console.log('node: ', node);
  
    const nodeContent = (
      <div style={{ height: '100%' }} {...otherProps}>
        <div
          className={
            styles.rowWrapper +
            (!canDrag ? ` ${styles.rowWrapperDragDisabled}` : '')
          }
        >
          {/* Set the row preview to be used during drag and drop */}
          {connectDragPreview(
            <div className={styles.innerRow}>
              {/* Drag-holder column */}
                <div className={ `${styles.dragHolderColumn} ${styles.dataTreeColumn}` }>
                  <div className={ styles.dragHolder } >
                    <span>..</span>
                    <span>..</span>
                    <span>..</span>
                  </div>
                </div>
                {/* Checkbox column */}
                <div className={ `${styles.checkboxColumn} ${styles.dataTreeColumn}` }>
                  <input className={styles.checkbox} type='checkbox' />
                </div>
                {/* Expand button arrow */}
                <div
                  className = {
                    styles.titleColumn +
                    (isLandingPadActive ? ` ${styles.rowLandingPad}` : '') +
                    (isLandingPadActive && !canDrop
                      ? ` ${styles.rowCancelPad}`
                      : '') +
                    (isSearchMatch ? ` ${styles.rowSearchMatch}` : '') +
                    (isSearchFocus ? ` ${styles.rowSearchFocus}` : '') +
                    (className ? ` ${className}` : '')
                  }
                  style={{
                    opacity: isDraggedDescendant ? 0.5 : 1,
                    ...style,
                  }}
                >
                  <div className={ styles.toggleBtn } >
                    {toggleChildrenVisibility &&
                     node.children &&
                     node.children.length > 0 && (
                       <button
                         type="button"
                         aria-label={node.expanded ? 'Collapse' : 'Expand'}
                         className={
                           node.expanded
                             ? styles.collapseButton
                             : styles.expandButton
                         }
                         style={{
                           left:
                             (lowerSiblingCounts.length) *
                             scaffoldBlockPxWidth,
                         }}
                         onClick={() =>
                           toggleChildrenVisibility({
                             node,
                             path,
                             treeIndex,
                           })
                         }
                       />
                     )}
                  {scaffold}
                </div>
                
                <div
                  className={
                    styles.rowContents +
                    (!canDrag ? ` ${styles.rowContentsDragDisabled}` : '')
                  }
                >
                  <div className={styles.rowLabel} style={{width: `${labelWidth}px`}}>
                    <span className={styles.rowTitle} >
                      {typeof nodeTitle === 'function'
                        ? nodeTitle({
                            node,
                            path,
                            treeIndex,
                          })
                        : nodeTitle}
                    </span>
                  </div>
                </div>
              </div>
              <div className = { `${styles.typeColumn} ${styles.dataTreeColumn}` }>
                {typeof nodeTitle === 'function'
                  ? nodeTitle({
                    node,
                    path,
                    treeIndex,
                  })
                  : nodeTitle}
              </div>
              <div className = { `${styles.visibilityColumn} ${styles.dataTreeColumn}` }>
                {typeof nodeTitle === 'function'
                  ? nodeTitle({
                    node,
                    path,
                    treeIndex,
                  })
                  : nodeTitle}
              </div>
              <div className = { `${styles.idColumn} ${styles.dataTreeColumn}` }>
                {typeof nodeTitle === 'function'
                  ? nodeTitle({
                    node,
                    path,
                    treeIndex,
                  })
                  : nodeTitle}
              </div>
              <div className = { `${styles.lastUpdColumn} ${styles.dataTreeColumn}` }>
                {typeof nodeTitle === 'function'
                  ? nodeTitle({
                    node,
                    path,
                    treeIndex,
                  })
                  : nodeTitle}
              </div>
              <div className = { `${styles.actionsColumn} ${styles.dataTreeColumn}` }>
                {typeof nodeTitle === 'function'
                  ? nodeTitle({
                    node,
                    path,
                    treeIndex,
                  })
                  : nodeTitle}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return canDrag
      ? connectDragSource(nodeContent, { dropEffect: 'copy' })
      : nodeContent;
  }
}

FileThemeNodeContentRenderer.defaultProps = {
  buttons: [],
  canDrag: false,
  canDrop: false,
  className: '',
  draggedNode: null,
  icons: [],
  isSearchFocus: false,
  isSearchMatch: false,
  parentNode: null,
  style: {},
  swapDepth: null,
  swapFrom: null,
  swapLength: null,
  title: null,
  toggleChildrenVisibility: null,
  onCheck: null,
};

FileThemeNodeContentRenderer.propTypes = {
  buttons: PropTypes.arrayOf(PropTypes.node),
  canDrag: PropTypes.bool,
  className: PropTypes.string,
  icons: PropTypes.arrayOf(PropTypes.node),
  isSearchFocus: PropTypes.bool,
  isSearchMatch: PropTypes.bool,
  listIndex: PropTypes.number.isRequired,
  lowerSiblingCounts: PropTypes.arrayOf(PropTypes.number).isRequired,
  node: PropTypes.shape({}).isRequired,
  path: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  scaffoldBlockPxWidth: PropTypes.number.isRequired,
  style: PropTypes.shape({}),
  swapDepth: PropTypes.number,
  swapFrom: PropTypes.number,
  swapLength: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  toggleChildrenVisibility: PropTypes.func,
  treeIndex: PropTypes.number.isRequired,
  treeId: PropTypes.string.isRequired,

  // Drag and drop API functions
  // Drag source
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  didDrop: PropTypes.bool.isRequired,
  draggedNode: PropTypes.shape({}),
  isDragging: PropTypes.bool.isRequired,
  parentNode: PropTypes.shape({}), // Needed for dndManager
  // Drop target
  canDrop: PropTypes.bool,
  isOver: PropTypes.bool.isRequired,
  onCheck: PropTypes.func,
};

export default FileThemeNodeContentRenderer;
