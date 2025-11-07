(function () {
  const SCALE_PX_PER_FOOT = 20; // 1 ft = 20 px
  const MARGIN_FT = 4; // drawing margin around plan

  // Building specs (in feet)
  const hall = { length: 24, width: 12 };
  const room = { length: 12, width: 11 }; // rooms oriented: 12' along length (y), 11' along width (x)
  const houseHeight = { feet: 11, inches: 6 };

  // Derived overall building dimensions
  // Width = left rooms (11) + hall (12) + right rooms (11) = 34 ft
  // Length = hall length = two rooms stacked: 12 + 12 = 24 ft
  const building = { width: 11 + 12 + 11, length: 24 };

  // Staircase (assumption)
  const stairs = { width: 6, length: 8 }; // 6' (x) ? 8' (y) inside a hall corner

  // Create figure container
  const app = document.getElementById('app');
  const figure = document.createElement('section');
  figure.className = 'figure';
  figure.innerHTML = `<header><div>??????? ????? ?????</div><div>${building.width}' ? ${building.length}'</div></header>`;

  const svgWrap = document.createElement('div');
  svgWrap.className = 'svg-wrap';
  const totalWidthPx = (building.width + 2 * MARGIN_FT) * SCALE_PX_PER_FOOT;
  const totalHeightPx = (building.length + 2 * MARGIN_FT) * SCALE_PX_PER_FOOT;

  const svg = createSvg(totalWidthPx, totalHeightPx);

  // markers
  const defs = createSvgElement('defs');
  defs.appendChild(makeArrowMarker('arrow', '#88a7ff'));
  svg.appendChild(defs);

  // Base origin (top-left corner of plan area excluding margins)
  const originX = MARGIN_FT * SCALE_PX_PER_FOOT;
  const originY = MARGIN_FT * SCALE_PX_PER_FOOT;

  // Outer building rectangle
  const outerRect = createSvgElement('rect', {
    x: originX,
    y: originY,
    width: building.width * SCALE_PX_PER_FOOT,
    height: building.length * SCALE_PX_PER_FOOT,
    class: 'outer',
    rx: 4, ry: 4
  });
  svg.appendChild(outerRect);

  // Layout computations
  const leftRoomsWidthFt = 11;
  const hallWidthFt = 12;
  const rightRoomsWidthFt = 11;

  // Left rooms (top and bottom) ? each 12' (y) ? 11' (x)
  const leftRoomTop = rectFeet(originX, originY, leftRoomsWidthFt, room.length);
  leftRoomTop.classList.add('space');
  svg.appendChild(leftRoomTop);
  addLabelCentered(leftRoomTop, `????`, `12' ? 11'`);

  const leftRoomBottom = rectFeet(originX, originY + room.length * SCALE_PX_PER_FOOT, leftRoomsWidthFt, room.length);
  leftRoomBottom.classList.add('space');
  svg.appendChild(leftRoomBottom);
  addLabelCentered(leftRoomBottom, `????`, `12' ? 11'`);

  // Hall (center) ? 24' (y) ? 12' (x)
  const hallX = originX + leftRoomsWidthFt * SCALE_PX_PER_FOOT;
  const hallRect = rectFeet(hallX, originY, hallWidthFt, hall.length);
  hallRect.classList.add('space');
  svg.appendChild(hallRect);
  addLabelCentered(hallRect, `???`, `24' ? 12'`);

  // Right rooms (top and bottom)
  const rightX = originX + (leftRoomsWidthFt + hallWidthFt) * SCALE_PX_PER_FOOT;
  const rightRoomTop = rectFeet(rightX, originY, rightRoomsWidthFt, room.length);
  rightRoomTop.classList.add('space');
  svg.appendChild(rightRoomTop);
  addLabelCentered(rightRoomTop, `????`, `12' ? 11'`);

  const rightRoomBottom = rectFeet(rightX, originY + room.length * SCALE_PX_PER_FOOT, rightRoomsWidthFt, room.length);
  rightRoomBottom.classList.add('space');
  svg.appendChild(rightRoomBottom);
  addLabelCentered(rightRoomBottom, `????`, `12' ? 11'`);

  // Stairs at bottom-left corner of the hall
  const stairsRect = rectFeet(
    hallX,
    originY + (hall.length - stairs.length) * SCALE_PX_PER_FOOT,
    stairs.width,
    stairs.length
  );
  stairsRect.classList.add('stairs');
  svg.appendChild(stairsRect);
  addLabel(stairsRect, 8, -6, `????????`);
  drawSteps(stairsRect, stairs.width, stairs.length, 8);

  // Dimensions: width on top, length on left
  const dimOffsetFt = 1.5;
  drawHorizontalDimension(
    svg,
    originX,
    originY - dimOffsetFt * SCALE_PX_PER_FOOT,
    building.width * SCALE_PX_PER_FOOT,
    `${building.width}' ??????`
  );
  drawVerticalDimension(
    svg,
    originX - dimOffsetFt * SCALE_PX_PER_FOOT,
    originY,
    building.length * SCALE_PX_PER_FOOT,
    `${building.length}' ?????`
  );

  // Height note and scale
  addFreeText(svg,
    originX + building.width * SCALE_PX_PER_FOOT - 4 * SCALE_PX_PER_FOOT,
    originY + building.length * SCALE_PX_PER_FOOT + 0.8 * SCALE_PX_PER_FOOT,
    `?????: ${houseHeight.feet}'-${houseHeight.inches}\"`
  ).setAttribute('class', 'height-note');

  addFreeText(svg,
    originX,
    originY + building.length * SCALE_PX_PER_FOOT + 0.8 * SCALE_PX_PER_FOOT,
    `?????: 1' = ${SCALE_PX_PER_FOOT} px`
  ).setAttribute('class', 'scale-note');

  // North arrow (top-right corner outside)
  const northX = originX + building.width * SCALE_PX_PER_FOOT + 1.4 * SCALE_PX_PER_FOOT;
  const northY = originY + 0.5 * SCALE_PX_PER_FOOT;
  const northGrp = createSvgElement('g');
  const northArrow = createSvgElement('path', {
    d: `M ${northX} ${northY + 30} L ${northX} ${northY} M ${northX} ${northY} l -6 8 l 6 -20 l 6 20 z`,
    fill: 'none', stroke: '#8ad6c1', 'stroke-width': 2
  });
  const northText = createSvgElement('text', { x: northX + 10, y: northY + 6, class: 'north' });
  northText.textContent = '?????';
  northGrp.appendChild(northArrow);
  northGrp.appendChild(northText);
  svg.appendChild(northGrp);

  svgWrap.appendChild(svg);
  figure.appendChild(svgWrap);
  app.appendChild(figure);

  // ????? helpers ?????
  function createSvg(width, height) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', `0 0 ${width} ${height}`);
    el.setAttribute('width', width);
    el.setAttribute('height', height);
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', '??????? ????? ?????');
    return el;
  }

  function createSvgElement(name, attrs = {}) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, String(v));
    }
    return el;
  }

  function ft(v) { return v * SCALE_PX_PER_FOOT; }

  function rectFeet(xPx, yPx, widthFt, heightFt) {
    return createSvgElement('rect', {
      x: xPx,
      y: yPx,
      width: ft(widthFt),
      height: ft(heightFt),
      rx: 2, ry: 2
    });
  }

  function addLabelCentered(rect, title, sizeText) {
    const x = parseFloat(rect.getAttribute('x')) + parseFloat(rect.getAttribute('width')) / 2;
    const y = parseFloat(rect.getAttribute('y')) + parseFloat(rect.getAttribute('height')) / 2;
    const t1 = createSvgElement('text', { x, y: y - 6, class: 'label', 'text-anchor': 'middle', 'dominant-baseline': 'ideographic' });
    t1.textContent = title;
    const t2 = createSvgElement('text', { x, y: y + 12, class: 'sub-label', 'text-anchor': 'middle' });
    t2.textContent = sizeText;
    rect.parentNode.appendChild(t1);
    rect.parentNode.appendChild(t2);
  }

  function addLabel(rect, dxFt, dyFt, text) {
    const x = parseFloat(rect.getAttribute('x')) + ft(dxFt);
    const y = parseFloat(rect.getAttribute('y')) + ft(dyFt);
    const t = createSvgElement('text', { x, y, class: 'label' });
    t.textContent = text;
    rect.parentNode.appendChild(t);
  }

  function makeArrowMarker(id, color) {
    const marker = createSvgElement('marker', {
      id,
      viewBox: '0 0 10 10',
      refX: 5, refY: 5,
      markerWidth: 6, markerHeight: 6,
      orient: 'auto-start-reverse'
    });
    const path = createSvgElement('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: color });
    marker.appendChild(path);
    return marker;
  }

  function drawHorizontalDimension(svg, x, y, lengthPx, label) {
    const line = createSvgElement('line', {
      x1: x, y1: y, x2: x + lengthPx, y2: y, class: 'dim-line', 'marker-start': 'url(#arrow)', 'marker-end': 'url(#arrow)'
    });
    const text = createSvgElement('text', { x: x + lengthPx / 2, y: y - 6, class: 'dim-text', 'text-anchor': 'middle' });
    text.textContent = label;
    svg.appendChild(line);
    svg.appendChild(text);
  }

  function drawVerticalDimension(svg, x, y, lengthPx, label) {
    const line = createSvgElement('line', {
      x1: x, y1: y, x2: x, y2: y + lengthPx, class: 'dim-line', 'marker-start': 'url(#arrow)', 'marker-end': 'url(#arrow)'
    });
    const text = createSvgElement('text', { x: x - 8, y: y + lengthPx / 2, class: 'dim-text', transform: `rotate(-90 ${x - 8} ${y + lengthPx / 2})`, 'text-anchor': 'middle' });
    text.textContent = label;
    svg.appendChild(line);
    svg.appendChild(text);
  }

  function addFreeText(svg, x, y, label) {
    const text = createSvgElement('text', { x, y });
    text.textContent = label;
    svg.appendChild(text);
    return text;
  }

  function drawSteps(stairRect, widthFt, lengthFt, stepCount) {
    const x = parseFloat(stairRect.getAttribute('x'));
    const y = parseFloat(stairRect.getAttribute('y'));
    const w = ft(widthFt);
    const h = ft(lengthFt);

    // outline already exists; add step treads horizontally
    for (let i = 1; i < stepCount; i++) {
      const yy = y + (h / stepCount) * i;
      const line = createSvgElement('line', { x1: x + 4, y1: yy, x2: x + w - 4, y2: yy, class: 'step-line' });
      stairRect.parentNode.appendChild(line);
    }
  }
})();
