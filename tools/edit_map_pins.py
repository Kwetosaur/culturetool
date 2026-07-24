#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Editeur visuel des positions des points de map.html.

Ouvre le fond de carte (map.jpg), affiche tous les points (PLACES + PLACES_FUTURE)
a leur position actuelle, et permet de :
  - les faire glisser a la souris pour corriger leur position
  - zoomer/deplacer la vue (molette = zoom, glisser-deposer sur le vide = pan)
  - chercher un point par id/titre dans le panneau de droite
  - ajuster finement au clavier (fleches = 0.05%, Maj+fleche = 0.5%)
  - enregistrer : reecrit x/y directement dans map.html ET public/map.html
    (un .bak est cree avant la premiere ecriture de la session)

Usage :
    python tools/edit_map_pins.py

Necessite Pillow (deja utilise ailleurs dans le projet) et tkinter (fourni avec
Python sur Windows).
"""
import os
import re
import shutil
import tkinter as tk
from tkinter import ttk, messagebox

from PIL import Image, ImageTk

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_HTML = os.path.join(ROOT, "map.html")
PUBLIC_MAP_HTML = os.path.join(ROOT, "public", "map.html")
MAP_IMG = os.path.join(ROOT, "map.jpg")

CAT_COLOR = {
    "mythologie": "#c9982f",
    "culture": "#3f7a5c",
    "creature": "#9a3535",
    "mystere": "#2a4f8a",
}
CANVAS_W = 1500
MIN_ZOOM, MAX_ZOOM = 1.0, 40.0
CLICK_TOLERANCE_PX = 11
NUDGE_SMALL = 0.05
NUDGE_BIG = 0.5

PIN_RE = re.compile(
    r"\{\s*id:'(?P<id>[\w-]+)',\s*title:'(?P<title>(?:[^'\\]|\\.)*)',"
    r"\s*cat:'(?P<cat>\w+)',"
    r"(?:\s*status:'(?P<status>\w+)',)?"
    r"(?:\s*href:'(?P<href>[^']*)',)?"
    r"\s*x:(?P<x>-?[\d.]+),\s*y:(?P<y>-?[\d.]+),"
    r"\s*icon:'(?P<icon>[^']*)'"
)


def load_pins(html_text):
    pins = []
    for m in PIN_RE.finditer(html_text):
        d = m.groupdict()
        pins.append({
            "id": d["id"],
            "title": d["title"].replace("\\'", "'"),
            "cat": d["cat"],
            "future": d["status"] == "future",
            "x": float(d["x"]),
            "y": float(d["y"]),
            "orig_x": float(d["x"]),
            "orig_y": float(d["y"]),
        })
    return pins


class PinEditor:
    def __init__(self, root):
        self.root = root
        root.title("Editeur de positions - carte du monde")

        if not os.path.exists(MAP_HTML):
            messagebox.showerror("Erreur", f"Introuvable : {MAP_HTML}")
            root.destroy()
            return

        self.html_text = open(MAP_HTML, encoding="utf-8").read()
        self.pins = load_pins(self.html_text)
        if not self.pins:
            messagebox.showerror("Erreur", "Aucun point trouve dans map.html (regex a verifier).")
            root.destroy()
            return

        self.src_img = Image.open(MAP_IMG).convert("RGB")
        self.sw, self.sh = self.src_img.size
        self.canvas_h = round(CANVAS_W * self.sh / self.sw)

        # etat de vue : centre (cx,cy en % 0-100) + zoom (1 = tout visible)
        self.cx, self.cy, self.zoom = 50.0, 50.0, 1.0

        self.selected = None
        self.drag_mode = None  # None | 'pin' | 'pan'
        self.drag_last = (0, 0)
        self.moved_px = 0
        self.cat_visible = {c: tk.BooleanVar(value=True) for c in CAT_COLOR}
        self.future_visible = tk.BooleanVar(value=True)

        self._build_ui()
        self._redraw()

    # ---------- UI ----------
    def _build_ui(self):
        main = ttk.Frame(self.root)
        main.pack(fill="both", expand=True)

        left = ttk.Frame(main)
        left.pack(side="left", fill="both", expand=True)
        self.canvas = tk.Canvas(left, width=CANVAS_W, height=self.canvas_h,
                                 bg="#111", cursor="fleur", highlightthickness=0)
        self.canvas.pack()
        self.canvas.bind("<ButtonPress-1>", self.on_down)
        self.canvas.bind("<B1-Motion>", self.on_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_up)
        self.canvas.bind("<MouseWheel>", self.on_wheel)       # Windows
        self.canvas.bind("<Button-4>", lambda e: self.zoom_at(e.x, e.y, 1.15))   # linux
        self.canvas.bind("<Button-5>", lambda e: self.zoom_at(e.x, e.y, 1 / 1.15))
        self.root.bind("<Left>", lambda e: self.nudge(-1, 0, e))
        self.root.bind("<Right>", lambda e: self.nudge(1, 0, e))
        self.root.bind("<Up>", lambda e: self.nudge(0, -1, e))
        self.root.bind("<Down>", lambda e: self.nudge(0, 1, e))
        self.root.bind("<Escape>", lambda e: self.select(None))

        self.status = ttk.Label(left, text="", anchor="w")
        self.status.pack(fill="x")

        right = ttk.Frame(main, width=340)
        right.pack(side="right", fill="y")
        right.pack_propagate(False)

        ttk.Label(right, text="Recherche (id ou titre)").pack(anchor="w", padx=8, pady=(8, 0))
        self.search_var = tk.StringVar()
        self.search_var.trace_add("write", lambda *a: self._refresh_list())
        ttk.Entry(right, textvariable=self.search_var).pack(fill="x", padx=8)

        list_frame = ttk.Frame(right)
        list_frame.pack(fill="both", expand=True, padx=8, pady=6)
        scroll = ttk.Scrollbar(list_frame)
        scroll.pack(side="right", fill="y")
        self.listbox = tk.Listbox(list_frame, yscrollcommand=scroll.set, exportselection=False)
        self.listbox.pack(side="left", fill="both", expand=True)
        scroll.config(command=self.listbox.yview)
        self.listbox.bind("<<ListboxSelect>>", self.on_list_select)

        filt = ttk.LabelFrame(right, text="Filtres")
        filt.pack(fill="x", padx=8, pady=6)
        for cat in CAT_COLOR:
            ttk.Checkbutton(filt, text=cat, variable=self.cat_visible[cat],
                             command=self._on_filter_change).pack(anchor="w", padx=6)
        ttk.Checkbutton(filt, text="pages a venir", variable=self.future_visible,
                         command=self._on_filter_change).pack(anchor="w", padx=6)

        info = ttk.LabelFrame(right, text="Point selectionne")
        info.pack(fill="x", padx=8, pady=6)
        self.info_id = ttk.Label(info, text="—", font=("", 9, "bold"))
        self.info_id.pack(anchor="w", padx=6, pady=(4, 0))
        self.info_title = ttk.Label(info, text="")
        self.info_title.pack(anchor="w", padx=6)

        xy_frame = ttk.Frame(info)
        xy_frame.pack(anchor="w", padx=6, pady=4)
        ttk.Label(xy_frame, text="x:").grid(row=0, column=0)
        self.x_var = tk.StringVar()
        x_entry = ttk.Entry(xy_frame, textvariable=self.x_var, width=8)
        x_entry.grid(row=0, column=1, padx=(2, 10))
        ttk.Label(xy_frame, text="y:").grid(row=0, column=2)
        self.y_var = tk.StringVar()
        y_entry = ttk.Entry(xy_frame, textvariable=self.y_var, width=8)
        y_entry.grid(row=0, column=3, padx=2)
        for e in (x_entry, y_entry):
            e.bind("<Return>", self.apply_xy_fields)
        ttk.Button(xy_frame, text="Appliquer", command=self.apply_xy_fields).grid(row=0, column=4, padx=6)

        ttk.Button(info, text="Centrer / zoomer sur ce point",
                   command=self.center_on_selected).pack(fill="x", padx=6, pady=(0, 6))

        actions = ttk.Frame(right)
        actions.pack(fill="x", padx=8, pady=10)
        ttk.Button(actions, text="Reinitialiser la vue", command=self.reset_view).pack(fill="x", pady=2)
        ttk.Button(actions, text="Annuler mes changements (recharger le fichier)",
                   command=self.reload_from_disk).pack(fill="x", pady=2)
        self.save_btn = ttk.Button(actions, text="Enregistrer dans map.html", command=self.save)
        self.save_btn.pack(fill="x", pady=(10, 2))

        self.dirty_label = ttk.Label(right, text="Aucune modification", foreground="#888")
        self.dirty_label.pack(anchor="w", padx=8)

        self._refresh_list()

    def _refresh_list(self):
        q = self.search_var.get().strip().lower()
        self.listbox.delete(0, "end")
        self._list_ids = []
        for p in sorted(self.pins, key=lambda p: p["id"]):
            if q and q not in p["id"].lower() and q not in p["title"].lower():
                continue
            tag = " (a venir)" if p["future"] else ""
            self.listbox.insert("end", f"{p['id']}  —  {p['title']}{tag}")
            self._list_ids.append(p["id"])

    def _on_filter_change(self):
        self._redraw()

    # ---------- coordonnees ----------
    def view_bounds(self):
        half = 50.0 / self.zoom
        x0, x1 = self.cx - half, self.cx + half
        y0, y1 = self.cy - half, self.cy + half
        return x0, x1, y0, y1

    def pct_to_canvas(self, px, py):
        x0, x1, y0, y1 = self.view_bounds()
        cx = (px - x0) / (x1 - x0) * CANVAS_W
        cy = (py - y0) / (y1 - y0) * self.canvas_h
        return cx, cy

    def canvas_to_pct(self, cx, cy):
        x0, x1, y0, y1 = self.view_bounds()
        px = x0 + (cx / CANVAS_W) * (x1 - x0)
        py = y0 + (cy / self.canvas_h) * (y1 - y0)
        return px, py

    def visible_pins(self):
        out = []
        for p in self.pins:
            if not self.cat_visible[p["cat"]].get():
                continue
            if p["future"] and not self.future_visible.get():
                continue
            out.append(p)
        return out

    # ---------- rendu ----------
    def _redraw(self):
        x0, x1, y0, y1 = self.view_bounds()
        x0c, x1c = max(0, x0), min(100, x1)
        y0c, y1c = max(0, y0), min(100, y1)
        box = (int(x0c / 100 * self.sw), int(y0c / 100 * self.sh),
               int(x1c / 100 * self.sw), int(y1c / 100 * self.sh))
        crop = self.src_img.crop(box)

        canvas_box_x0, _ = self.pct_to_canvas(x0c, 0)
        canvas_box_x1, _ = self.pct_to_canvas(x1c, 0)
        _, canvas_box_y0 = self.pct_to_canvas(0, y0c)
        _, canvas_box_y1 = self.pct_to_canvas(0, y1c)
        paste_w = max(1, int(canvas_box_x1 - canvas_box_x0))
        paste_h = max(1, int(canvas_box_y1 - canvas_box_y0))
        resample = Image.BILINEAR
        crop = crop.resize((paste_w, paste_h), resample)

        base = Image.new("RGB", (CANVAS_W, self.canvas_h), "#1c140d")
        base.paste(crop, (int(canvas_box_x0), int(canvas_box_y0)))
        self._tkimg = ImageTk.PhotoImage(base)

        self.canvas.delete("all")
        self.canvas.create_image(0, 0, anchor="nw", image=self._tkimg)

        for p in self.visible_pins():
            cxp, cyp = self.pct_to_canvas(p["x"], p["y"])
            if not (-20 <= cxp <= CANVAS_W + 20 and -20 <= cyp <= self.canvas_h + 20):
                continue
            col = CAT_COLOR[p["cat"]]
            r = 9 if p is self.selected else 6
            dash = (3, 2) if p["future"] else None
            self.canvas.create_oval(cxp - r, cyp - r, cxp + r, cyp + r,
                                     outline=col, width=3, fill="#f2e9d2", dash=dash,
                                     tags=("pin", p["id"]))
            if p is self.selected:
                self.canvas.create_text(cxp + r + 4, cyp - r - 4, text=p["id"], fill="#fff",
                                         anchor="sw", font=("", 9, "bold"))

        n_dirty = sum(1 for p in self.pins if p["x"] != p["orig_x"] or p["y"] != p["orig_y"])
        self.dirty_label.config(
            text="Aucune modification" if n_dirty == 0 else f"{n_dirty} point(s) modifie(s), pas encore enregistre",
            foreground="#888" if n_dirty == 0 else "#c9982f")
        self.status.config(text=f"zoom x{self.zoom:.1f}   |   molette = zoom, glisser le vide = deplacer, "
                                 f"glisser un point = le repositionner")

    # ---------- selection ----------
    def select(self, pin):
        self.selected = pin
        if pin is None:
            self.info_id.config(text="—")
            self.info_title.config(text="")
            self.x_var.set("")
            self.y_var.set("")
        else:
            self.info_id.config(text=pin["id"])
            self.info_title.config(text=pin["title"])
            self.x_var.set(f"{pin['x']:.1f}")
            self.y_var.set(f"{pin['y']:.1f}")
            try:
                idx = self._list_ids.index(pin["id"])
                self.listbox.selection_clear(0, "end")
                self.listbox.selection_set(idx)
                self.listbox.see(idx)
            except ValueError:
                pass
        self._redraw()

    def on_list_select(self, event):
        sel = self.listbox.curselection()
        if not sel:
            return
        pid = self._list_ids[sel[0]]
        pin = next(p for p in self.pins if p["id"] == pid)
        self.select(pin)

    def apply_xy_fields(self, event=None):
        if not self.selected:
            return
        try:
            x = float(self.x_var.get())
            y = float(self.y_var.get())
        except ValueError:
            messagebox.showwarning("Valeur invalide", "x et y doivent etre des nombres.")
            return
        self.selected["x"] = max(0.0, min(100.0, x))
        self.selected["y"] = max(0.0, min(100.0, y))
        self._redraw()

    def center_on_selected(self):
        if not self.selected:
            return
        self.cx, self.cy = self.selected["x"], self.selected["y"]
        self.zoom = max(self.zoom, 8.0)
        self._redraw()

    # ---------- interactions souris ----------
    def find_pin_near(self, cx, cy):
        best, best_d = None, CLICK_TOLERANCE_PX
        for p in self.visible_pins():
            pxp, pyp = self.pct_to_canvas(p["x"], p["y"])
            d = ((pxp - cx) ** 2 + (pyp - cy) ** 2) ** 0.5
            if d < best_d:
                best, best_d = p, d
        return best

    def on_down(self, event):
        self.moved_px = 0
        self.drag_last = (event.x, event.y)
        hit = self.find_pin_near(event.x, event.y)
        if hit:
            self.drag_mode = "pin"
            self._drag_pin = hit
        else:
            self.drag_mode = "pan"

    def on_drag(self, event):
        dx, dy = event.x - self.drag_last[0], event.y - self.drag_last[1]
        self.moved_px += abs(dx) + abs(dy)
        self.drag_last = (event.x, event.y)
        if self.drag_mode == "pin":
            px, py = self.canvas_to_pct(event.x, event.y)
            self._drag_pin["x"] = round(max(0.0, min(100.0, px)), 2)
            self._drag_pin["y"] = round(max(0.0, min(100.0, py)), 2)
            if self.selected is self._drag_pin:
                self.x_var.set(f"{self._drag_pin['x']:.1f}")
                self.y_var.set(f"{self._drag_pin['y']:.1f}")
            self._redraw()
        elif self.drag_mode == "pan":
            x0, x1, y0, y1 = self.view_bounds()
            self.cx -= dx / CANVAS_W * (x1 - x0)
            self.cy -= dy / self.canvas_h * (y1 - y0)
            self._redraw()

    def on_up(self, event):
        if self.drag_mode == "pin" and self.moved_px < 3:
            self.select(self._drag_pin)
        self.drag_mode = None

    def on_wheel(self, event):
        factor = 1.15 if event.delta > 0 else 1 / 1.15
        self.zoom_at(event.x, event.y, factor)

    def zoom_at(self, ex, ey, factor):
        px, py = self.canvas_to_pct(ex, ey)
        self.zoom = max(MIN_ZOOM, min(MAX_ZOOM, self.zoom * factor))
        x0, x1, y0, y1 = self.view_bounds()
        # recentre pour garder (px,py) sous le curseur
        frac_x = ex / CANVAS_W
        frac_y = ey / self.canvas_h
        half = 50.0 / self.zoom
        self.cx = px - (frac_x * 2 - 1) * half
        self.cy = py - (frac_y * 2 - 1) * half
        self._redraw()

    def nudge(self, dx, dy, event):
        if not self.selected:
            return
        step = NUDGE_BIG if (event.state & 0x0001) else NUDGE_SMALL  # Shift
        self.selected["x"] = round(max(0.0, min(100.0, self.selected["x"] + dx * step)), 2)
        self.selected["y"] = round(max(0.0, min(100.0, self.selected["y"] + dy * step)), 2)
        self.x_var.set(f"{self.selected['x']:.1f}")
        self.y_var.set(f"{self.selected['y']:.1f}")
        self._redraw()

    def reset_view(self):
        self.cx, self.cy, self.zoom = 50.0, 50.0, 1.0
        self._redraw()

    def reload_from_disk(self):
        if not messagebox.askyesno("Recharger", "Annuler toutes les modifications non enregistrees ?"):
            return
        self.html_text = open(MAP_HTML, encoding="utf-8").read()
        self.pins = load_pins(self.html_text)
        self.select(None)
        self._refresh_list()
        self._redraw()

    # ---------- sauvegarde ----------
    def save(self):
        dirty = [p for p in self.pins if p["x"] != p["orig_x"] or p["y"] != p["orig_y"]]
        if not dirty:
            messagebox.showinfo("Rien a faire", "Aucune position n'a change.")
            return
        for path in (MAP_HTML, PUBLIC_MAP_HTML):
            if not os.path.exists(path):
                continue
            bak = path + ".bak"
            if not os.path.exists(bak):
                shutil.copy2(path, bak)
            txt = open(path, encoding="utf-8").read()
            n = 0
            for p in dirty:
                pat = re.compile(r"(id:'" + re.escape(p["id"]) + r"'.*?\bx:)[-\d.]+(,\s*y:)[-\d.]+",
                                  re.DOTALL)
                new_txt, c = pat.subn(
                    lambda m: m.group(1) + f"{p['x']:.1f}" + m.group(2) + f"{p['y']:.1f}",
                    txt, count=1)
                if c:
                    txt = new_txt
                    n += 1
            open(path, "w", encoding="utf-8").write(txt)
            print(f"{path}: {n} point(s) mis a jour")
        for p in dirty:
            p["orig_x"], p["orig_y"] = p["x"], p["y"]
        self._redraw()
        messagebox.showinfo("Enregistre",
                             f"{len(dirty)} point(s) enregistre(s) dans map.html et public/map.html.\n"
                             f"Pense a relancer 'npm run build' pour voir le resultat sur le site.")


def main():
    root = tk.Tk()
    PinEditor(root)
    root.mainloop()


if __name__ == "__main__":
    main()
