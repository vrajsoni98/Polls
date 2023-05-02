class Poll {
    constructor(root, title) {
        this.root = root;
        this.selected = sessionStorage.getItem("poll-selected");
        this.endpoint = "https://live-poll.onrender.com/poll";
        //"http://localhost:3000/poll"
        this.root.insertAdjacentHTML("afterbegin", `
        <div class="poll__title">${title}</div>
        `);

        this._refresh();
    }

    async _refresh() {
        const response = await fetch(this.endpoint);
        const data = await response.json();

        this.root.querySelectorAll(".poll__option").forEach(option => {
            option.remove();
        });

        document.querySelector(".reset").addEventListener("click", () => {
            fetch(this.endpoint+"/reset", {
                method: "POST"
            }).then(() => {
                sessionStorage.clear();
                this._refresh();
            })
        });

        for (const option of data) {
            const template = document.createElement("template");
            const fragement = template.content;


            template.innerHTML = `
                <div class="poll__option ${this.selected === option.label ? "poll__option--selected" : "" }">
                    <div class="poll__option-fill"></div>
                    <div class="poll__option-info">
                        <span class="poll__label">${option.label}</span>
                        <span class="poll__percentage">${option.percentage}% | ${option.votes} votes</span>
                    </div>
                </div>
            `;

            if (!this.selected) {
                fragement.querySelector(".poll__option").addEventListener("click", () => {
                    fetch(this.endpoint, {
                        method: "POST",
                        body: `add=${option.label}`,
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    }).then(() => {
                        this.selected = option.label;

                        sessionStorage.setItem("poll-selected", option.label);

                        this._refresh();
                    })
                });
            }

            fragement.querySelector(".poll__option-fill").style.width = `${option.percentage}%`;

            this.root.appendChild(fragement);
        }
    }
}

const p = new Poll(
    document.querySelector(".poll"),
    "How many cups of coffee will you need to finish this task?"
);