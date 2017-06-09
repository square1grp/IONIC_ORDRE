if (!Ortery) {
	var Ortery = function () {
	}
}
Ortery.ImageCreator = function () {
};
Ortery.ImageCreator.VERSION = "1.4.100";
var ortery_carousels = {};
(function (d) {
	var c = {init: function (k) {
		var j = {xmlPath: "./", objPath: "./Images/", iconPath: "./HTML5/Images/", btnSize: 0, magnifierSize: 0, imgFolderName: "", centerInWindow: true, allowScaleImgUp: true, isConcurrent: false};
		return this.each(function (m) {
			var l = d(this), o = this.style, n = d.extend(j, k);
			if (d.isArray(n.xmlPath)) {
				n.xmlPath = n.xmlPath[m]
			}
			if (d.isArray(n.objPath)) {
				n.objPath = n.objPath[m]
			}
			if (d.isArray(n.iconPath)) {
				n.iconPath = n.iconPath[m]
			}
			if (!l.attr("class")) {
				l.attr("class", "animateCreatorContainer")
			}
			if (!o.width) {
				l.width(800)
			}
			if (!o.height) {
				l.height(600)
			}
			l.attr("onselectstart", "return false;").css("background-image", 'url("' + n.iconPath + 'iconLoading.gif")');
			if (n.centerInWindow) {
				g.call(l)
			}
			e.call(l, n)
		})
	}, toggleConcurrent: function () {
		for (var j in ortery_carousels) {
			if (ortery_carousels[j].isConcurrent) {
				ortery_carousels[j].isConcurrent = false
			} else {
				ortery_carousels[j].isConcurrent = true
			}
		}
	}, openConcurrent: function () {
		for (var j in ortery_carousels) {
			ortery_carousels[j].isConcurrent = true
		}
	}, closeConcurrent: function () {
		for (var j in ortery_carousels) {
			ortery_carousels[j].isConcurrent = false
		}
	}, nextColumn: function () {
		var k = ortery_carousels[this.attr("id")];
		if (k.isConcurrent) {
			for (var j in ortery_carousels) {
				if (!ortery_carousels[j].VCtK03eS2SO && ortery_carousels[j].$Agz9PsSRDQC.is(":hidden")) {
					ortery_carousels[j].jqSS2lreeD8Click(ortery_carousels[j].iconPath)
				}
			}
		} else {
			if (!k.VCtK03eS2SO && k.$Agz9PsSRDQC.is(":hidden")) {
				k.jqSS2lreeD8Click(k.iconPath)
			}
		}
	}, previousColumn: function () {
		var k = ortery_carousels[this.attr("id")];
		if (k.isConcurrent) {
			for (var j in ortery_carousels) {
				if (!ortery_carousels[j].VCtK03eS2SO && ortery_carousels[j].$Agz9PsSRDQC.is(":hidden")) {
					ortery_carousels[j].zM8K9z1YQQTClick(ortery_carousels[j].iconPath)
				}
			}
		} else {
			if (!k.VCtK03eS2SO && k.$Agz9PsSRDQC.is(":hidden")) {
				k.zM8K9z1YQQTClick(k.iconPath)
			}
		}
	}, mouseRight: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var j in ortery_carousels) {
				if (ortery_carousels[j].OiJqbOm9ea6 != 2 && ortery_carousels[j].$Agz9PsSRDQC.is(":hidden")) {
					(function (k) {
						ortery_carousels[k].mouseTimer = setInterval(function () {
							ortery_carousels[k].uWGX6k3KWPR(60, 0, "keyboard")
						}, 100)
					})(j);
					ortery_carousels[j].f5lHO8TYLoU = true
				}
			}
		} else {
			if (j.OiJqbOm9ea6 != 2 && j.$Agz9PsSRDQC.is(":hidden")) {
				j.mouseTimer = setInterval(function () {
					j.uWGX6k3KWPR(60, 0, "keyboard")
				}, 100);
				j.f5lHO8TYLoU = true
			}
		}
	}, mouseLeft: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var j in ortery_carousels) {
				if (ortery_carousels[j].OiJqbOm9ea6 != 2 && ortery_carousels[j].$Agz9PsSRDQC.is(":hidden")) {
					(function (k) {
						ortery_carousels[k].mouseTimer = setInterval(function () {
							ortery_carousels[k].uWGX6k3KWPR(-60, 0, "keyboard")
						}, 100)
					})(j);
					ortery_carousels[j].f5lHO8TYLoU = true
				}
			}
		} else {
			if (j.OiJqbOm9ea6 != 2 && j.$Agz9PsSRDQC.is(":hidden")) {
				j.mouseTimer = setInterval(function () {
					j.uWGX6k3KWPR(-60, 0, "keyboard")
				}, 100);
				j.f5lHO8TYLoU = true
			}
		}
	}, mouseUp: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var j in ortery_carousels) {
				if (ortery_carousels[j].OiJqbOm9ea6 != 2 && ortery_carousels[j].$Agz9PsSRDQC.is(":hidden")) {
					(function (k) {
						ortery_carousels[k].mouseTimer = setInterval(function () {
							ortery_carousels[k].uWGX6k3KWPR(0, -60, "keyboard")
						}, 100)
					})(j);
					ortery_carousels[j].f5lHO8TYLoU = true
				}
			}
		} else {
			if (j.OiJqbOm9ea6 != 2 && j.$Agz9PsSRDQC.is(":hidden")) {
				j.mouseTimer = setInterval(function () {
					j.uWGX6k3KWPR(0, -60, "keyboard")
				}, 100);
				j.f5lHO8TYLoU = true
			}
		}
	}, mouseDown: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var j in ortery_carousels) {
				if (ortery_carousels[j].OiJqbOm9ea6 != 2 && ortery_carousels[j].$Agz9PsSRDQC.is(":hidden")) {
					(function (k) {
						ortery_carousels[k].mouseTimer = setInterval(function () {
							ortery_carousels[k].uWGX6k3KWPR(0, 60, "keyboard")
						}, 100)
					})(j);
					ortery_carousels[j].f5lHO8TYLoU = true
				}
			}
		} else {
			if (j.OiJqbOm9ea6 != 2 && j.$Agz9PsSRDQC.is(":hidden")) {
				j.mouseTimer = setInterval(function () {
					j.uWGX6k3KWPR(0, 60, "keyboard")
				}, 100);
				j.f5lHO8TYLoU = true
			}
		}
	}, mouseMoveEnd: function () {
		for (var j in ortery_carousels) {
			if (ortery_carousels[j].OiJqbOm9ea6 != 2 && ortery_carousels[j].$Agz9PsSRDQC.is(":hidden")) {
				ortery_carousels[j].f5lHO8TYLoU = false;
				if (ortery_carousels[j].mouseTimer) {
					clearInterval(ortery_carousels[j].mouseTimer)
				}
			}
		}
	}, toggleControlBar: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (ortery_carousels[k].$Agz9PsSRDQC.is(":hidden") && ortery_carousels[k].OiJqbOm9ea6 === 2 && !ortery_carousels[k].VCtK03eS2SO) {
					if (ortery_carousels[k].$GsQ8kM1GWuI.is(":hidden")) {
						ortery_carousels[k].showControlBar()
					} else {
						ortery_carousels[k].hideControlBar()
					}
				}
			}
		} else {
			if (j.OiJqbOm9ea6 === 2) {
				if (j.$Agz9PsSRDQC.is(":hidden") && j.OiJqbOm9ea6 === 2 && !j.VCtK03eS2SO) {
					if (j.$GsQ8kM1GWuI.is(":hidden")) {
						j.showControlBar()
					} else {
						j.hideControlBar()
					}
				}
			}
		}
	}, showControlBar: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (ortery_carousels[k].$Agz9PsSRDQC.is(":hidden") && ortery_carousels[k].OiJqbOm9ea6 === 2 && !ortery_carousels[k].VCtK03eS2SO) {
					ortery_carousels[k].showControlBar()
				}
			}
		} else {
			if (j.$Agz9PsSRDQC.is(":hidden") && j.OiJqbOm9ea6 === 2 && !j.VCtK03eS2SO) {
				j.showControlBar()
			}
		}
	}, hideControlBar: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (ortery_carousels[k].$Agz9PsSRDQC.is(":hidden") && ortery_carousels[k].OiJqbOm9ea6 === 2 && !ortery_carousels[k].VCtK03eS2SO) {
					ortery_carousels[k].hideControlBar()
				}
			}
		} else {
			if (j.$Agz9PsSRDQC.is(":hidden") && j.OiJqbOm9ea6 === 2 && !j.VCtK03eS2SO) {
				j.hideControlBar()
			}
		}
	}, toggleMagnifier: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				ortery_carousels[k].$DQ2DLgmdZf7.trigger("click", "keyboard")
			}
		} else {
			j.$DQ2DLgmdZf7.trigger("click", "keyboard")
		}
	}, openMagnifier: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (!ortery_carousels[k].Ynb0ppyCril) {
					ortery_carousels[k].$DQ2DLgmdZf7.trigger("click", "keyboard")
				}
			}
		} else {
			if (!j.Ynb0ppyCril) {
				j.$DQ2DLgmdZf7.trigger("click", "keyboard")
			}
		}
	}, closeMagnifier: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (ortery_carousels[k].Ynb0ppyCril) {
					ortery_carousels[k].$DQ2DLgmdZf7.trigger("click", "keyboard")
				}
			}
		} else {
			if (j.Ynb0ppyCril) {
				j.$DQ2DLgmdZf7.trigger("click", "keyboard")
			}
		}
	}, setTurnSpeed: function (j) {
		var k = ortery_carousels[this.attr("id")];
		k.npzfKdfAiKi = j
	}, autoTurn: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (!ortery_carousels[k].c0gwMt5h9N7 && !ortery_carousels[k].VCtK03eS2SO) {
					ortery_carousels[k].uWQFhlupf7BClick(j.iconPath + "btn", "pic")
				}
			}
		} else {
			if (!j.c0gwMt5h9N7 && !j.VCtK03eS2SO) {
				j.uWQFhlupf7BClick(j.iconPath + "btn", "pic")
			}
		}
	}, stopTurn: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (ortery_carousels[k].c0gwMt5h9N7 && !ortery_carousels[k].VCtK03eS2SO) {
					ortery_carousels[k].uWQFhlupf7BClick(j.iconPath + "btn", "pic")
				}
			}
		} else {
			if (j.c0gwMt5h9N7 && !j.VCtK03eS2SO) {
				j.uWQFhlupf7BClick(j.iconPath + "btn", "pic")
			}
		}
	}, toggleTurn: function () {
		var j = ortery_carousels[this.attr("id")];
		if (j.isConcurrent) {
			for (var k in ortery_carousels) {
				if (!ortery_carousels[k].VCtK03eS2SO) {
					ortery_carousels[k].uWQFhlupf7BClick(j.iconPath + "btn", "pic")
				}
			}
		} else {
			if (!j.VCtK03eS2SO) {
				j.uWQFhlupf7BClick(j.iconPath + "btn", "pic")
			}
		}
	}};
	d.fn.animate360 = function (j) {
		if (c[j]) {
			return c[j].apply(this, Array.prototype.slice.call(arguments, 1))
		} else {
			if (typeof j === "object" || !j) {
				return c.init.apply(this, arguments)
			} else {
				d.error("Method " + j + " does not exist on jQuery.tooltip")
			}
		}
	};
	var b = (function () {
		var l = navigator.platform, k = l.match(/iPhone/i) || l.match(/iPad/i), m, j;
		if (k) {
			return true
		}
		m = navigator.userAgent;
		j = m.match(/iPhone/i) || m.match(/iPad/i) || m.match(/Android/i) || m.match(/Windows CE/i) || m.match(/Blackberry/i) || m.match(/Palm/i);
		return!!j
	})();

	function e(k) {
		var l = this, m = {}, j = [];
		d.ajax({type: "GET", cache: false, url: k.xmlPath /*+ "Profile.xml?" + Math.random()*/, dataType: "text xml", success: function (o) {
			var n = a(o, k.imgFolderName);
			m = n[0];
			j = n[1]
		}, complete: function () {
			var r = l.width(), t = l.height(), p = [r, t], o, q, s, n;
			if (m.CylRP3beGep) {
				p[0] = r * 5 / 6
			}
			if (m.OiJqbOm9ea6 === 2) {
				o = ~~(r * (b ? 0.08 : 0.06));
				p[1] = t - o
			}
			q = f(p, [m.QHdSctOQUhP, m.T6ehRoF9MsZ], k.allowScaleImgUp);
			m.imgFitSize = q;
			m.imgDisplaySpace = p;
			m.iconPath = k.iconPath;
			m.btnIconSize = k.btnSize;
			m.magnifierSize = k.magnifierSize;
			m.TbOcuZOACPg = b;
			m.isConcurrent = k.isConcurrent;
			s = h(k.objPath, m, q);
			n = m.fguyh4qGkIR || m.Ze9OFGlRJG4 * m.Pvnh8IZu58o;
			i.call(l, m, j, s, n);
			m = null;
			j = null
		}})
	}

	function a(o, n) {
		var m, q = {}, k = [], j = [], p = [], l = [];
		if (typeof o == "string") {
			m = new ActiveXObject("Microsoft.XMLDOM");
			m.async = false;
			m.loadXML(o)
		} else {
			m = o
		}
		d(m).find("Profile").each(function () {
			d(this).find("Object").each(function () {
				var r = d(this);
				q = {a9qfc3U8f4H: n || r.attr("Name"), cgbwoxfmr5q: r.attr("Model"), Pvnh8IZu58o: ~~r.attr("Rows"), Ze9OFGlRJG4: ~~r.attr("Columns"), QHdSctOQUhP: ~~r.attr("Width"), T6ehRoF9MsZ: ~~r.attr("Height"), XGz39AwgcsG: (r.attr("Inertia") === "True"), magnifier: (r.attr("Magnifier") === "True"), KAmINBGdpn0: r.attr("FileExtension") || ".jpg", isQRExist: (r.attr("QR") === "True")};
				if (window.location.protocol === "file:") {
					q.isQRExist = false
				}
				r.find("Controller").each(function () {
					var s = d(this);
					q.OiJqbOm9ea6 = ~~(s.attr("PhaseIn"));
					q.vd2rZi1j6Cs = (s.attr("RepeatAutoPlay") === "True");
					q.npzfKdfAiKi = ~~(s.attr("RotateTime"));
					q.cTdczqrNba5 = (s.attr("Direction") === "CW")
				});
				r.find("Mobility").each(function () {
					var s = d(this);
					q.a3Hqo6zjpvT = ~~(s.attr("ImageLevel"))
				})
			});
			d(this).find("MotionFrames").each(function () {
				q.EinRhhlxGUa = ~~(d(this).attr("Start"));
				q.fguyh4qGkIR = ~~(d(this).attr("End"));
				q.CylRP3beGep = false;
				d(this).find("ImageSet").each(function () {
					var r = d(this), s = {piwFOiIPqzW: ~~r.attr("Name"), cccQLUMlGFO: r.attr("No") - 1, EIJbDtYAz4H: r.attr("Begin") - 1, nRr5kRBaRmx: r.attr("Done") - 1};
					k.push(s);
					s = null;
					q.CylRP3beGep = true
				});
				d(this).find("Frame").each(function () {
					var t, s = d(this), r = {IUsn7oroH2p: ~~s.attr("Index") - 1, yt0qtRNsk6U: ~~s.attr("ImageSet"), IVD6WjlBMJm: ~~s.attr("Symbol"), RiI63I0xRUB: ~~s.attr("Angle"), K3YpKKYOfc9: ~~s.attr("PosX"), OzQrr1TzfJE: ~~s.attr("PosY"), XDMLYf5FFIZ: ~~s.attr("PlayType"), UVI8iKYIdhb: ~~s.attr("Interval"), la3mwNfIMGQ: s.text()};
					t = r.yt0qtRNsk6U + "K" + r.XDMLYf5FFIZ + "K" + r.UVI8iKYIdhb;
					if (d.inArray(t, p) == -1) {
						p.push(t)
					}
					j.push(r)
				})
			})
		});
		l = [k, p, j];
		m = null;
		k = null;
		j = null;
		p = null;
		return[q, l]
	}

	function g() {
		var o = this, p, l, n, j, k = this.width(), m = this.height();
		p = function () {
			var q = window.innerWidth || document.documentElement.clientWidth, t = window.innerHeight || document.documentElement.clientHeight, s = q > k ? (q - k) / 2 : 0, r = t > m ? (t - m) / 2 : 0;
			o.css({"margin-left": s, "margin-top": r})
		};
		p();
		if (b) {
			l = "onorientationchange"in window;
			n = l ? "orientationchange" : "resize";
			j = function () {
				var q = window.innerHeight || document.documentElement.clientHeight;
				o.css("marginTop", (q - m) / 2)
			};
			if (navigator.userAgent.match(/Android/i)) {
				setInterval(j, 400)
			} else {
				addEventListener(n, function () {
					setTimeout(j, 200)
				}, false)
			}
		} else {
			d(window).resize(p)
		}
	}

	function i(o, j, n, k) {
		var m, l;
		if (n.counter === k) {
			m = new Ortery.ImageCreator();
			m.CdBIaga1Gg6(this, n, o, j);
			o.fguyh4qGkIR = null;
			delete o.fguyh4qGkIR;
			ortery_carousels[this.attr("id")] = m
		} else {
			l = this;
			setTimeout(function () {
				i.call(l, o, j, n, k)
			}, 500)
		}
	}

	function f(j, k, r) {
		var n = j[0], l = j[1], p = k[0] / k[1], m = n / l, q, o;
		if (m >= 1) {
			if (p >= 1 && p > m) {
				q = n;
				o = q / p
			} else {
				o = l;
				q = o * p
			}
		} else {
			if (p <= 1 && p < m) {
				o = l;
				q = o * p
			} else {
				q = n;
				o = q / p
			}
		}
		if (!r) {
			if (q > k[0] || o > k[1]) {
				return k
			}
		}
		return[~~q, ~~o]
	}

	function h(u, r, w) {
		var l = r.cgbwoxfmr5q, q = [], j = 1, t = 1, n = "", s = r.Pvnh8IZu58o, y = r.Ze9OFGlRJG4, k = r.fguyh4qGkIR || r.Ze9OFGlRJG4 * r.Pvnh8IZu58o, v = w[0], o = w[1], x = 0, p, z, m;
		z = (function () {
			if (l === "Hemispherical") {
				return function (B, A, C) {
					return(B + "N" + C + "-" + A + r.KAmINBGdpn0)
				}
			} else {
				return function (B, A, C) {
					return(B + "img" + A + r.KAmINBGdpn0)
				}
			}
		})();
		q.counter = 0;
		m = b ? r.a3Hqo6zjpvT : 2;
		u += (r.a9qfc3U8f4H + "/Lv" + m + "/");
		r.a9qfc3U8f4H = null;
		delete r.a9qfc3U8f4H;
		for (; x < k; x++) {
			p = new Image(v, o);
			n = t + "";
			if (n.length === 1) {
				n = "0" + n
			}
			(function (A) {
				d(p).load(function () {
					q.counter++;
					q[A] = this;
					p = null
				})
			})(x);
			p.src = z(u, n, j);
			if (l === "Hemispherical" && t >= r.Ze9OFGlRJG4) {
				t = 1;
				j++
			} else {
				t++
			}
			p = null;
			delete p
		}
		return q
	}
})(jQuery);
