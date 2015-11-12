append.define("canvas", [], function() {
	function canvas_oop(){
		if (typeof canvas_oop._initialized == "undefined") {
			var this_prototype = canvas_oop.prototype;
			this_prototype._method = canvas_oop__method;
			canvas_oop._initialized = true;
		}
		// globals
	var modelViewMatrix, rotationAxis, projectionMatrix;
	var shaderProg, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
		shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;
	var vertBuffer, colorBuffer;


		var onerev = 10000; // ms
		var exTime = Date.now();
		var vertshader_id;
		var fragshader_id;
		
		function canvas_oop__method(){
		}
		
		canvas_oop__method.draw2D = function(id){
			var canvas = document.getElementById(id);
			var c2dCtx = null;
			var exmsg = "Cannot get 2D context from canvas";
			try {
				c2dCtx = canvas.getContext('2d');
			}
			catch (e)
			{
				exmsg = "Exception thrown:" + e.toString();
			}
			if (!c2dCtx) {
				alert(exmsg);
				throw new Error(exmsg);
			}
			c2dCtx.fillStyle = "#0000ff";
			c2dCtx.beginPath();
			c2dCtx.moveTo(250, 40);        // Top Corner
			c2dCtx.lineTo(450, 250);         // Bottom Right
			c2dCtx.lineTo(50, 250);         // Bottom Left
			c2dCtx.closePath();
			c2dCtx.fill();
		}
		
		canvas_oop__method.draw3D = function(id){
			var canvas = document.getElementById(id);
        
			var glCtx = null;
			var exmsg = "WebGL not supported";
			try
			{
				glCtx = canvas.getContext("experimental-webgl");
			}
			catch (e)
			{
				exmsg = "Exception thrown: " + e.toString();
			}
			if (!glCtx)
			{
				alert(exmsg);
				throw new Error(exmsg);
			}
			// set viewport
			glCtx.viewport(0, 0, canvas.width, canvas.height);

			// Vertex Data
			vertBuffer = glCtx.createBuffer();
			glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertBuffer);
			var verts = [
				0.0, 1.0, 0.0,
				-1.0, 0.0, 0.0,
				0.0, 0.0, 1.0,

				0.0, 1.0, 0.0,
				0.0, 0.0, 1.0,
				1.0, 0.0, 0.0,

				0.0, 1.0, 0.0,
				1.0, 0.0, 0.0,
				0.0, 0.0, -1.0,

				0.0, 1.0, 0.0,
				0.0, 0.0, -1.0,
				-1.0, 0.0, 0.0
			];
			glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(verts), glCtx.STATIC_DRAW);

			colorBuffer = glCtx.createBuffer();
			glCtx.bindBuffer(glCtx.ARRAY_BUFFER, colorBuffer);
			var faceColors = [
				[0.0, 0.0, 1.0, 1.0], // Front  (blue)
				[1.0, 1.0, 0.0, 1.0], // right   (yellow)
				[0.0, 1.0, 0.0, 1.0], // back   (green)
				[1.0, 0.0, 0.0, 1.0], // left   (red)
			];
			var vertColors = [];
			faceColors.forEach(function(color) {
				[0,1,2].forEach(function () {
					vertColors = vertColors.concat(color);
				});
				vertColors = vertColors.concat(faceColors[0]);
			});
			glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(vertColors), glCtx.STATIC_DRAW);

			var vertShaderCode = document.getElementById(vertshader_id).textContent;
			var fragShaderCode = document.getElementById(fragshader_id).textContent;

			var fragShader = glCtx.createShader(glCtx.FRAGMENT_SHADER);

			glCtx.shaderSource(fragShader, fragShaderCode);
			glCtx.compileShader(fragShader);

			if (!glCtx.getShaderParameter(fragShader, glCtx.COMPILE_STATUS)) {
			var errmsg = "fragment shader compile failed: " + glCtx.getShaderInfoLog(fragShader);
			alert(errmsg);
			throw new Error()
			}

			var vertShader = glCtx.createShader(glCtx.VERTEX_SHADER);


			glCtx.shaderSource(vertShader, vertShaderCode);
			glCtx.compileShader(vertShader);

			if (!glCtx.getShaderParameter(vertShader, glCtx.COMPILE_STATUS)) {
			var errmsg = "vertex shader compile failed : " + glCtx.getShaderInfoLog(vertShader);
			alert(errmsg);
			throw new Error(errmsg)
			}


			// link the compiled vertex and fragment shaders 
			shaderProg = glCtx.createProgram();
			glCtx.attachShader(shaderProg, vertShader);
			glCtx.attachShader(shaderProg, fragShader);
			glCtx.linkProgram(shaderProg);

			// get pointers to the shader params
			shaderVertexPositionAttribute = glCtx.getAttribLocation(shaderProg, "vertPos");
			glCtx.enableVertexAttribArray(shaderVertexPositionAttribute);

			shaderVertexColorAttribute = glCtx.getAttribLocation(shaderProg, "vertColor");
			glCtx.enableVertexAttribArray(shaderVertexColorAttribute);

			shaderProjectionMatrixUniform = glCtx.getUniformLocation(shaderProg, "pjMatrix");
			shaderModelViewMatrixUniform = glCtx.getUniformLocation(shaderProg, "mvMatrix");


			if (!glCtx.getProgramParameter(shaderProg, glCtx.LINK_STATUS)) {
			var errmsg = "failed to initialize shader with data matrices";
			alert(errmsg);
			throw new Error(errmsg);
			}

			modelViewMatrix = mat4.create();  // global - used in animation
			mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -3]);

			projectionMatrix = mat4.create();
			mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 100);

			rotationAxis = vec3.create();   // global - used in animation
			vec3.normalize(rotationAxis, [0, 1, 0]);
			canvas_oop__method.update(glCtx);

		}
		
		canvas_oop__method.init = function(map_handle){
			var theNodeTag = append.use("NodeTag");
			vertshader_id = G_id._method.get_id();
			fragshader_id = G_id._method.get_id();
			
			theNodeTag.AddNodeTag(map_handle["body_id"],"script",vertshader_id,"","x-shader/vertshader");
			theNodeTag.AddNodeTag(map_handle["body_id"],"script",fragshader_id,"","x-shader/fragshader");
			theNodeTag.SetTextInNode(vertshader_id,"attribute vec3 vertPos;attribute vec4 vertColor;uniform mat4 mvMatrix;uniform mat4 pjMatrix;varying lowp vec4 vColor;void main(void) {gl_Position = pjMatrix * mvMatrix * vec4(vertPos, 1.0);vColor = vertColor;}");
			theNodeTag.SetTextInNode(fragshader_id,"varying lowp vec4 vColor;void main(void) {gl_FragColor = vColor;}");
			
		}
		
		canvas_oop__method.draw = function(ctx){
			
			ctx.clearColor(1.0, 1.0, 1.0, 1.0);//调用将视口清空为白色
			ctx.enable(ctx.DEPTH_TEST);//确保启用了深度缓冲 (z-buffer)
			ctx.clear(ctx.COLOR_BUFFER_BIT  | ctx.DEPTH_BUFFER_BIT);//清除颜色和深度缓冲
			ctx.useProgram(shaderProg);//之前编译和链接的 vertShader 和 fragShader 组成 被加载，以供ctx.useProgram() 调用执行 GPU
			//调用被绑定到 GLSL 着色器程序的属性
			ctx.bindBuffer(ctx.ARRAY_BUFFER, vertBuffer);
			ctx.vertexAttribPointer(shaderVertexPositionAttribute, 3 /*  vertex size */, ctx.FLOAT, false, 0, 0);
			ctx.bindBuffer(ctx.ARRAY_BUFFER, colorBuffer);
			ctx.vertexAttribPointer(shaderVertexColorAttribute, 4 /* color size */, ctx.FLOAT, false, 0, 0);
			
			//调用设置模型视图和投影矩阵，以供顶点着色器进行只读访问。
			ctx.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
			var now = Date.now();
			var elapsed = now - exTime;
			exTime = now;
			var angle = Math.PI * 2 * elapsed/onerev;
			mat4.rotate(modelViewMatrix, modelViewMatrix, angle, rotationAxis);
			ctx.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
			ctx.drawArrays(ctx.TRIANGLES, 0, 12 /* num of vertex */);	//调用将四个为一组的三角形（一共有 12 个顶点）渲染到视口。
			
		}
		canvas_oop__method.update = function(gl){
			var id = window.setInterval(function () {
				canvas_oop__method.draw(gl);
			},1);
			canvas_oop__method.draw(gl);
		}
	}
	
	return canvas_oop;
});