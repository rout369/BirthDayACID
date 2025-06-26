(function(window){

    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function bezier(cp, t) {  
        var p1 = cp[0].mul((1 - t) * (1 - t));
        var p2 = cp[1].mul(2 * t * (1 - t));
        var p3 = cp[2].mul(t * t); 
        return p1.add(p2).add(p3);
    }  

    function inheart(x, y, r) {
        var z = ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) - (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
        return z < 0;
    }

    Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype = {
        clone: function() {
            return new Point(this.x, this.y);
        },
        add: function(o) {
            p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        },
        sub: function(o) {
            p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        },
        div: function(n) {
            p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        },
        mul: function(n) {
            p = this.clone();
            p.x *= n;
            p.y *= n;
            return p;
        }
    }

    Heart = function() {
        var points = [], x, y, t;
        for (var i = 10; i < 30; i += 0.2) {
            t = i / Math.PI;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            points.push(new Point(x, y));
        }
        this.points = points;
        this.length = points.length;
    }
    Heart.prototype = {
        get: function(i, scale) {
            return this.points[i].mul(scale || 1);
        }
    }

    Seed = function(tree, point, scale, color) {
        this.tree = tree;

        var scale = scale || 1
        var color = '#FFC0CB';

        this.heart = {
            point  : point,
            scale  : scale,
            color  : color,
            figure : new Heart(),
        }

        this.cirle = {
            point  : point,
            scale  : scale,
            color  : color,
            radius : 5,
        }
    }
    Seed.prototype = {
        draw: function() {
            this.drawHeart();
            this.drawText();
        },
        addPosition: function(x, y) {
            this.cirle.point = this.cirle.point.add(new Point(x, y));
        },
        canMove: function() {
            return this.cirle.point.y < (this.tree.height + 20); 
        },
        move: function(x, y) {
            this.clear();
            this.drawCirle();
            this.addPosition(x, y);
        },
        canScale: function() {
            return this.heart.scale > 0.2;
        },
        setHeartScale: function(scale) {
            this.heart.scale *= scale;
        },
        scale: function(scale) {
            this.clear();
            this.drawCirle();
            this.drawHeart();
            this.setHeartScale(scale);
        },
        drawHeart: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < heart.figure.length; i++) {
                var p = heart.figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawCirle: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, color = cirle.color, 
                scale = cirle.scale, radius = cirle.radius;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawText: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 15);
            ctx.lineTo(130, 15);
            ctx.stroke();

            ctx.moveTo(0, 0);
            ctx.scale(0.75, 0.75);
            ctx.font = "12px,Verdana";
            ctx.fillText("Click Me:) ", 30, -5);
            ctx.fillText("Birthday Queen !", 28, 10);
            ctx.restore();
        },
        clear: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, scale = cirle.scale, radius = 26;
            var w = h = (radius * scale);
            ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        },
        hover: function(x, y) {
            var ctx = this.tree.ctx;
            var pixel = ctx.getImageData(x, y, 1, 1);
            return pixel.data[3] == 255
        }
    }

    Footer = function(tree, width, height, speed) {
        this.tree = tree;
        this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
        this.width = width;
        this.height = height;
        this.speed = speed || 2;
        this.length = 0;
    }
    Footer.prototype = {
        draw: function() {
            var ctx = this.tree.ctx, point = this.point;
            var len = this.length / 2;

            ctx.save();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = this.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.lineTo(-len, 0);
            ctx.stroke();
            ctx.restore();

            if (this.length < this.width) {
                this.length += this.speed;
            }
        }
    }

    Tree = function(canvas, width, height, opt) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.opt = opt || {};

        this.record = {};
        
        this.initSeed();
        this.initFooter();
        this.initBranch();
        this.initBloom();
    }
    Tree.prototype = {
        initSeed: function() {
            var seed = this.opt.seed || {};
            var x = seed.x || this.width / 2;
            var y = seed.y || this.height / 2;
            var point = new Point(x, y);
            var color = seed.color || '#FF0000';
            var scale = seed.scale || 1;

            this.seed = new Seed(this, point, scale, color);
        },

        initFooter: function() {
            var footer = this.opt.footer || {};
            var width = footer.width || this.width;
            var height = footer.height || 5;
            var speed = footer.speed || 2;
            this.footer = new Footer(this, width, height, speed);
        },

        initBranch: function() {
            var branchs = this.opt.branch || []
            this.branchs = [];
            this.addBranchs(branchs);
        },

        initBloom: function() {
            var bloom = this.opt.bloom || {};
            var cache = [],
                num = bloom.num || 500, 
                width = bloom.width || this.width,
                height = bloom.height || this.height,
                figure = this.seed.heart.figure;
            var r = 240, x, y;
            for (var i = 0; i < num; i++) {
                cache.push(this.createBloom(width, height, r, figure));
            }
            this.blooms = [];
            this.bloomsCache = cache;
        },

        toDataURL: function(type) {
            return this.canvas.toDataURL(type);
        },

        draw: function(k) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k];
            if (!rec) {
                return ;
            }
            var point = rec.point,
                image = rec.image;

            ctx.save();
            ctx.putImageData(image, point.x, point.y);
            ctx.restore();
        },

        addBranch: function(branch) {
            this.branchs.push(branch);
        },

        addBranchs: function(branchs){
            var s = this, b, p1, p2, p3, r, l, c;
            for (var i = 0; i < branchs.length; i++) {
                b = branchs[i];
                p1 = new Point(b[0], b[1]);
                p2 = new Point(b[2], b[3]);
                p3 = new Point(b[4], b[5]);
                r = b[6];
                l = b[7];
                c = b[8]
                s.addBranch(new Branch(s, p1, p2, p3, r, l, c)); 
            }
        },

        removeBranch: function(branch) {
            var branchs = this.branchs;
            for (var i = 0; i < branchs.length; i++) {
                if (branchs[i] === branch) {
                    branchs.splice(i, 1);
                }
            }
        },

        canGrow: function() {
            return !!this.branchs.length;
        },
        grow: function() {
            var branchs = this.branchs;
            for (var i = 0; i < branchs.length; i++) {
                var branch = branchs[i];
                if (branch) {
                    branch.grow();
                }
            }
        },

        addBloom: function (bloom) {
            this.blooms.push(bloom);
        },

        removeBloom: function (bloom) {
            var blooms = this.blooms;
            for (var i = 0; i < blooms.length; i++) {
                if (blooms[i] === bloom) {
                    blooms.splice(i, 1);
                }
            }
        },

        createBloom: function(width, height, radius, figure, color, alpha, angle, scale, place, speed) {
            var x, y;
            while (true) {
                x = random(20, width - 20);
                y = random(20, height - 20);
                if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
                    return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
                }
            }
        },
        
        canFlower: function() {
            return !!this.blooms.length;
        }, 
        flower: function(num) {
            var s = this, blooms = s.bloomsCache.splice(0, num);
            for (var i = 0; i < blooms.length; i++) {
                s.addBloom(blooms[i]);
            }
            blooms = s.blooms;
            for (var j = 0; j < blooms.length; j++) {
                blooms[j].flower();
            }
        },

        snapshot: function(k, x, y, width, height) {
            var ctx = this.ctx;
            var image = ctx.getImageData(x, y, width, height); 
            this.record[k] = {
                image: image,
                point: new Point(x, y),
                width: width,
                height: height
            }
        },
        setSpeed: function(k, speed) {
            this.record[k || "move"].speed = speed;
        },
        move: function(k, x, y) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k || "move"];
            var point = rec.point,
                image = rec.image,
                speed = rec.speed || 10,
                width = rec.width,
                height = rec.height; 

            i = point.x + speed < x ? point.x + speed : x;
            j = point.y + speed < y ? point.y + speed : y; 

            ctx.save();
            ctx.clearRect(point.x, point.y, width, height);
            ctx.putImageData(image, i, j);
            ctx.restore();

            rec.point = new Point(i, j);
            rec.speed = speed * 0.95;

            if (rec.speed < 2) {
                rec.speed = 2;
            }
            return i < x || j < y;
        },

        jump: function() {
            var s = this, blooms = s.blooms;
            if (blooms.length) {
                for (var i = 0; i < blooms.length; i++) {
                    blooms[i].jump();
                }
            } 
            if ((blooms.length && blooms.length < 3) || !blooms.length) {
                var bloom = this.opt.bloom || {},
                    width = bloom.width || this.width,
                    height = bloom.height || this.height,
                    figure = this.seed.heart.figure;
                var r = 240, x, y;
                for (var i = 0; i < random(1,2); i++) {
                    blooms.push(this.createBloom(width / 2 + width, height, r, figure, null, 1, null, 1, new Point(random(-100,600), 720), random(200,300)));
                }
            }
        }
    }

    Branch = function(tree, point1, point2, point3, radius, length, branchs) {
        this.tree = tree;
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.radius = radius;
        this.length = length || 100;    
        this.len = 0;
        this.t = 1 / (this.length - 1);   
        this.branchs = branchs || [];
    }

    Branch.prototype = {
        grow: function() {
            var s = this, p; 
            if (s.len <= s.length) {
                p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
                s.draw(p);
                s.len += 1;
                s.radius *= 0.97;
            } else {
                s.tree.removeBranch(s);
                s.tree.addBranchs(s.branchs);
            }
        },
        draw: function(p) {
            var s = this;
            var ctx = s.tree.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = '#FFC0CB';
            ctx.shadowBlur = 2;
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        }
    }

    Bloom = function(tree, point, figure, color, alpha, angle, scale, place, speed) {
        this.tree = tree;
        this.point = point;
        this.color = color || 'rgb(255,' + random(0, 255) + ',' + random(0, 255) + ')';
        this.alpha = alpha || random(0.3, 1);
        this.angle = angle || random(0, 360);
        this.scale = scale || 0.1;
        this.place = place;
        this.speed = speed;

        this.figure = figure;
    }
    Bloom.prototype = {
        setFigure: function(figure) {
            this.figure = figure;
        },
        flower: function() {
            var s = this;
            s.draw();
            s.scale += 0.1;
            if (s.scale > 1) {
                s.tree.removeBloom(s);
            }
        },
        draw: function() {
            var s = this, ctx = s.tree.ctx, figure = s.figure;

            ctx.save();
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.translate(s.point.x, s.point.y);
            ctx.scale(s.scale, s.scale);
            ctx.rotate(s.angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < figure.length; i++) {
                var p = figure.get(i);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        jump: function() {
            var s = this, height = s.tree.height;

            if (s.point.x < -20 || s.point.y > height + 20) {
                s.tree.removeBloom(s);
            } else {
                s.draw();
                s.point = s.place.sub(s.point).div(s.speed).add(s.point);
                s.angle += 0.05;
                s.speed -= 1;
            }
        }
    }

    window.random = random;
    window.bezier = bezier;
    window.Point = Point;
    window.Tree = Tree;

})(window);

// function startLeafFallFromTree() {
//     const canvas = document.getElementById("canvas");
//     if (!canvas) {
//         console.error("Canvas element with ID 'canvas' not found.");
//         return;
//     }

//     const canvasRect = canvas.getBoundingClientRect();

//     const colors = ['#FF69B4', '#FF1493', '#FFB6C1'];
//     const totalLeaves = 20;

//     for (let i = 0; i < totalLeaves; i++) {
//         const leaf = document.createElement("div");
//         leaf.textContent = "❤";
//         leaf.style.position = "fixed";
//         leaf.style.left = (canvasRect.left + 400 + Math.random() * 300) + "px";
//         leaf.style.top = (canvasRect.top + 50 + Math.random() * 50) + "px";
//         leaf.style.fontSize = (Math.random() * 8 + 16) + "px";
//         leaf.style.color = colors[Math.floor(Math.random() * colors.length)];
//         leaf.style.opacity = Math.random();
//         leaf.style.zIndex = 999;
//         leaf.style.pointerEvents = "none";
//         leaf.style.animation = `treeFall ${5 + Math.random() * 3}s linear infinite`;
//         document.body.appendChild(leaf);
//     }
// }

// function showCharactersUnderTree(imagePath) {
//     const canvas = document.getElementById("canvas");
//     if (!canvas) {
//         console.error("Canvas element with ID 'canvas' not found.");
//         return;
//     }

//     const canvasRect = canvas.getBoundingClientRect();

//     const container = document.createElement('div');
//     container.style.position = 'fixed';
//     container.classList.add('fade-in');

//     // Center the single image under the canvas (80px width, so half is 40px)
//     const centerX =  50 + canvasRect.left + canvasRect.width / 2 - 100;
//     const bottomY = 20 + canvasRect.top + canvasRect.height - 200; // Adjust for larger image

//     container.style.left = `${centerX}px`;
//     container.style.top = `${bottomY}px`;

//     container.style.zIndex = 1000;
//     container.style.display = 'flex';
//     container.style.pointerEvents = 'none';

//     const imageElement = document.createElement('div');

//     // Handle the image with error checking
//     if (imagePath.match(/\.(jpeg|jpg|png|gif)$/i) || imagePath.startsWith('http')) {
//         const img = new Image();
//         img.src = imagePath;
//         img.onload = () => {
//             console.log(`Image ${imagePath} loaded successfully.`);
//             imageElement.style.backgroundImage = `url(${imagePath})`;
//             imageElement.style.width = '200px'; // Increased size
//             imageElement.style.height = '200px'; // Increased size
//             imageElement.style.backgroundSize = 'cover';
//             imageElement.style.backgroundPosition = 'center';
//             imageElement.style.backgroundRepeat = 'no-repeat';
//         };
//         img.onerror = () => {
//             console.error(`Failed to load image: ${imagePath}. Using fallback emoji.`);
//             imageElement.textContent = '😊';
//             imageElement.style.fontSize = '80px'; // Match larger size
//         };
//     } else {
//         console.warn(`Invalid image path: ${imagePath}. Using fallback emoji.`);
//         imageElement.textContent = '😊';
//         imageElement.style.fontSize = '80px'; // Match larger size
//     }

//     container.appendChild(imageElement);
//     document.body.appendChild(container);
// }

// // Run both effects after the tree fully finishes growing & flowering (18s)
// setTimeout(() => {
//     startLeafFallFromTree();
//     showCharactersUnderTree('images/new.png'); // Use relative path to your local image
// }, 18000);

// // Add animation style for falling hearts and fade-in
// const leafStyle = document.createElement("style");
// leafStyle.innerHTML = `
// @keyframes treeFall {
//     0% {
//         transform: translate(0px, 0px) rotate(0deg);
//         opacity: 1;
//     }
//     100% {
//         transform: translate(-200px, 100vh) rotate(360deg);
//         opacity: 0;
//     }
// }
// .fade-in {
//     animation: fadeIn 1s ease-in;
// }
// @keyframes fadeIn {
//     0% { opacity: 0; }
//     100% { opacity: 1; }
// }
// `;
// document.head.appendChild(leafStyle);

function startLeafFallFromTree() {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error("Canvas element with ID 'canvas' not found.");
        return;
    }

    const canvasRect = canvas.getBoundingClientRect();

    const colors = ['#FF69B4', '#FF1493', '#FFB6C1'];
    const totalLeaves = 20;

    for (let i = 0; i < totalLeaves; i++) {
        const leaf = document.createElement("div");
        leaf.textContent = "❤";
        leaf.style.position = "fixed";
        leaf.style.left = (canvasRect.left + 400 + Math.random() * 300) + "px";
        leaf.style.top = (canvasRect.top + 50 + Math.random() * 50) + "px";
        leaf.style.fontSize = (Math.random() * 8 + 16) + "px";
        leaf.style.color = colors[Math.floor(Math.random() * colors.length)];
        leaf.style.opacity = Math.random();
        leaf.style.zIndex = 999;
        leaf.style.pointerEvents = "none";
        leaf.style.animation = `treeFall ${5 + Math.random() * 3}s linear infinite`;
        document.body.appendChild(leaf);
    }
}

function showCharactersUnderTree(imagePath) {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error("Canvas element with ID 'canvas' not found.");
        return;
    }

    const canvasRect = canvas.getBoundingClientRect();

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.classList.add('fade-in');

    // Center the single image under the canvas
    const centerX = 50 + canvasRect.left + canvasRect.width / 2 - 100;
    const bottomY = 20 + canvasRect.top + canvasRect.height - 200;

    container.style.left = `${centerX}px`;
    container.style.top = `${bottomY}px`;

    container.style.zIndex = 1000;
    container.style.display = 'flex';
    container.style.pointerEvents = 'none';

    const imageElement = document.createElement('div');

    // Handle the image with error checking
    if (imagePath.match(/\.(jpeg|jpg|png|gif)$/i) || imagePath.startsWith('http')) {
        const img = new Image();
        img.src = imagePath;
        img.onload = () => {
            console.log(`Image ${imagePath} loaded successfully.`);
            imageElement.style.backgroundImage = `url(${imagePath})`;
            imageElement.style.width = '200px';
            imageElement.style.height = '200px';
            imageElement.style.backgroundSize = 'cover';
            imageElement.style.backgroundPosition = 'center';
            imageElement.style.backgroundRepeat = 'no-repeat';
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${imagePath}. Using fallback emoji.`);
            imageElement.textContent = '😊';
            imageElement.style.fontSize = '80px';
        };
    } else {
        console.warn(`Invalid image path: ${imagePath}. Using fallback emoji.`);
        imageElement.textContent = '😊';
        imageElement.style.fontSize = '80px';
    }

    container.appendChild(imageElement);
    document.body.appendChild(container);
}

function startCrackerBurst() {
    const canvas = document.getElementById("canvas");
    if (!canvas) {
        console.error("Canvas element with ID 'canvas' not found.");
        return;
    }

    const particlesPerBurst = 30; // Number of particles per burst
    const simultaneousBursts = 6; // Number of simultaneous bursts
    const colors = ['#FFD700', '#FF4500', '#FF0000', '#00FF00', '#00B7EB'];

    for (let burst = 0; burst < simultaneousBursts; burst++) {
        // Random position anywhere on the screen for each burst
        const burstX = Math.random() * window.innerWidth;
        const burstY = Math.random() * window.innerHeight;

        for (let i = 0; i < particlesPerBurst; i++) {
            const particle = document.createElement("div");
            particle.style.position = "fixed";
            particle.style.left = `${burstX}px`;
            particle.style.top = `${burstY}px`;
            particle.style.width = `${Math.random() * 4 + 4}px`; // Larger particles: 4-8px
            particle.style.height = particle.style.width;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = "50%";
            particle.style.zIndex = 1001;
            particle.style.pointerEvents = "none";

            // Random angle and larger speed for wider spread
            const angle = Math.random() * 2 * Math.PI;
            const speed = Math.random() * 120 + 80; // Larger spread: 80-200px
            const duration = Math.random() * 1 + 0.5; // 0.5 to 1.5 seconds

            particle.style.animation = `crackerBurst ${duration}s linear`;
            document.body.appendChild(particle);

            // Calculate final position
            const translateX = Math.cos(angle) * speed;
            const translateY = Math.sin(angle) * speed;
            particle.style.setProperty('--finalX', `${translateX}px`);
            particle.style.setProperty('--finalY', `${translateY}px`);

            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, duration * 1000);
        }
    }
}

// Run leaf fall and character display once, start cracker burst in a loop
setTimeout(() => {
    startLeafFallFromTree();
    showCharactersUnderTree('images/new.png');
    // Start cracker burst loop every 2 seconds
    const burstInterval = setInterval(() => {
        startCrackerBurst();
    }, 2000);
    // Note: Interval will stop automatically when window is closed
}, 18000);

// Add animation styles for falling hearts, fade-in, and cracker burst
const leafStyle = document.createElement("style");
leafStyle.innerHTML = `
@keyframes treeFall {
    0% {
        transform: translate(0px, 0px) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translate(-200px, 100vh) rotate(360deg);
        opacity: 0;
    }
}
.fade-in {
    animation: fadeIn 1s ease-in;
}
@keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
}
@keyframes crackerBurst {
    0% {
        transform: translate(0, 0);
  opacity: 1;
    }
    100% {
        transform: translate(var(--finalX), var(--finalY));
        opacity: 0;
    }
}
`;
document.head.appendChild(leafStyle);