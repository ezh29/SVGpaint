const draw = SVG('drawing').size('100%', '99%');
const shapes = [];
const group = draw.group();
let index = 0;
let shapeType = 'mouse paint';
let color = "#000000";
let stroke = 10;
let undoLimit = 40;
let undoCnt = undoLimit;

//draw
const getDrawObject = () => {
    const option = {
        stroke: color,
        'stroke-width': stroke,
        'fill-opacity': 0,
    };
    switch (shapeType) {
        case 'mouse paint':
            return draw.polyline().attr(option);
        case 'ellipse':
            return draw.ellipse().attr(option);
        case 'rect':
            return draw.rect().attr(option);
        case 'line':
            return draw.line().attr(option);
        case 'polygon':
            return draw.polygon().attr(option);
    }
    return null;
}
draw.on('mousedown', event => {
    const shape = getDrawObject();
    shapes[index] = shape;
    if (shape.type === 'polygon') {
        shapes[index].draw('point', event).putIn(group);
        document.addEventListener('keydown', function (e) {
            if (e.keyCode == 13) {
                shape.draw('point', event)
            }
        });
    } else {
        shape.draw(event).putIn(group);
    }
    undoCnt = undoLimit;
});
draw.on('mousemove', event => {
    if (shapeType === 'mouse paint' && shapes[index]) {
        shapes[index].draw('point', event).putIn(group);
    }
})
draw.on('mouseup', event => {
    if (shapeType === 'mouse paint') {
        shapes[index].draw('stop', event).putIn(group);
    } else if (shapeType === 'polygon') {
        shapes[index].draw('done').putIn(group);
    } else {
        shapes[index].draw(event).putIn(group);
    }
    index++;
})


// shapetype, strokecolor, stroke, zoom
const getShapeType = () => {
    var obj_length = document.getElementsByName("shapeType").length;
    for (var i = 0; i < obj_length; i++) {
        if (document.getElementsByName("shapeType")[i].checked == true) {
            shapeType = document.getElementsByName("shapeType")[i].value;
        }
    }
}
const getStrokeColor = (e) => {
    color = e.target.value;
}
const getStroke = (e) => {
    stroke = e.target.value;
    const strokeValue = document.getElementById("strokeValue");
    strokeValue.innerText = `${e.target.value}`;
    document.getElementById('stroke').value = stroke;
}
const zoomSvg = (e) => {
    const zvgZoom = document.querySelector("#drawing svg");
    const zoomValue = document.getElementById("zoomValue");
    zoomValue.innerText = `${e.target.value}%`;
    zvgZoom.style.transform = `scale(${e.target.value / 100})`;
    document.getElementById('zoomRange').value = e.target.value;
}

//undo, redo
const undo = () => {
    if (undoCnt > 0 && index > 0) {
        shapes[index - 1].remove();
        index--;
        undoCnt--;
    }
}
const redo = () => {
    if (undoCnt < undoLimit) {
        group.add(shapes[index]);
        index++;
        undoCnt++;
    }
}

//file read, download
const download = () => {
    const svg = document.querySelector("#drawing svg");
    //get svg source.
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    //add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    //add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    downloadString(source, 'image/svg+xml', `다운로드_${getCurrentDate()}.svg`)
}
const downloadString = (text, fileType, fileName) => {
    const blob = new Blob([text], { type: fileType });
    const a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
}
const readFile = (evt) => {
    //Retrieve the first (and only!) File from the FileList object
    const file = evt.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            if (file.type.indexOf('svg') > 0) {
                const div = document.createElement("div");
                div.innerHTML = contents;
                const svg = div.querySelector("svg");
                document.querySelector("#drawing svg").prepend(svg);
            } else {
                alert('svg파일이 아님');
                //fileinfo.html('<div class="ui red message"><i class="icon red alert"></i> Wrong file type. Only SVG files allowed</div>');
            }
        }
        reader.readAsText(file);
    }
}

// 부트스트랩 tooltip활성화
const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})

//현재 시간 구하기 yyyyMMddhhmmss
function getCurrentDate() {
    const date = new Date();
    let year = date.getFullYear().toString();

    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    let day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    let hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    let minites = date.getMinutes();
    minites = minites < 10 ? '0' + minites.toString() : minites.toString();

    let seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    return year + month + day + hour + minites + seconds;
}