const player = document.getElementById("jugador");
const container = document.getElementById("cuadrado");
const enemiesContainer = document.getElementById("enemies-container");
const levIndicator = document.getElementById("levelIndicator");
let nlevel = 1;
let playerLives = 3;
levIndicator.innerHTML = `<h2>Level ${nlevel}</h2>`;

const containerRect = container.getBoundingClientRect();
const playerRect = player.getBoundingClientRect();
const maxX = containerRect.width - playerRect.width;
const maxY = containerRect.height - playerRect.height - 60;
let moveUp = false,
  moveDown = false,
  moveLeft = false,
  moveRight = false;
let positionX = 0,
  positionY = 0;
const playerSpeed = 10;

document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      moveUp = true;
      break;
    case "ArrowDown":
      moveDown = true;
      break;
    case "ArrowLeft":
      moveLeft = true;
      break;
    case "ArrowRight":
      moveRight = true;
      break;
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowUp":
      moveUp = false;
      break;
    case "ArrowDown":
      moveDown = false;
      break;
    case "ArrowLeft":
      moveLeft = false;
      break;
    case "ArrowRight":
      moveRight = false;
      break;
  }
});

function updatePlayerPosition() {
  if (moveUp) positionY = Math.max(0, positionY - playerSpeed);
  if (moveDown) positionY = Math.min(maxY, positionY + playerSpeed);
  if (moveLeft) positionX = Math.max(0, positionX - playerSpeed);
  if (moveRight) positionX = Math.min(maxX, positionX + playerSpeed);
  player.style.left = positionX + "px";
  player.style.top = positionY + "px";
  requestAnimationFrame(updatePlayerPosition);
}
updatePlayerPosition();
function createEnemy() {
  const enemyContainer = document.createElement("div");
  enemyContainer.className = "enemy-container";
  enemyContainer.style.animation = `moveEnemy ${
    3 + Math.random() * 4
  }s linear infinite`;
  const enemy = document.createElement("img");
  enemy.className = "enemy";
  if (nlevel < 3) {
    enemy.src = "./assets/images/nave5.png";
  } else if (nlevel <= 4) {
    enemy.src = "./assets/images/nave3.png";
  } else if (nlevel <= 6) {
    enemy.src = "./assets/images/nave2.png";
  } else if (nlevel > 6) {
    enemy.src = "./assets/images/nave6.png";
  }
  enemy.dataset.health = "100";
  const healthBar = document.createElement("div");
  healthBar.className = "health-indicator";
  enemyContainer.appendChild(enemy);
  enemyContainer.appendChild(healthBar);
  enemiesContainer.appendChild(enemyContainer);

  return enemyContainer;
}

function shoot() {
  const bullet = document.createElement("div");
  bullet.className = "bullet";
  bullet.style.left = positionX + playerRect.width / 2 - 1.5 + "px";
  bullet.style.top = positionY + playerRect.height + "px";
  container.appendChild(bullet);

  const moveBullet = setInterval(() => {
    const currentTop = parseInt(bullet.style.top);
    bullet.style.top = currentTop + 10 + "px";
    const bulletRect = bullet.getBoundingClientRect();

    document.querySelectorAll(".enemy").forEach((enemy) => {
      const enemyRect = enemy.getBoundingClientRect();
      if (checkCollision(bulletRect, enemyRect)) {
        clearInterval(moveBullet);
        bullet.remove();
        const remainingHealth = damageEnemy(enemy, 30);
        if (remainingHealth <= 0) {
          enemy.parentElement.remove();
          checkLevelCompletion();
        }
      }
    });

    if (currentTop > containerRect.height) {
      clearInterval(moveBullet);
      bullet.remove();
    }
  }, 30);
}

document.addEventListener("keydown", (event) => {
  if (event.key === " ") shoot();
});
function enemyShoot() {
  document.querySelectorAll(".enemy").forEach((enemy) => {
    const bullet = document.createElement("div");
    bullet.className = "enemy-bullet";
    const enemyRect = enemy.getBoundingClientRect();

    bullet.style.left =
      enemyRect.left - containerRect.left + enemy.offsetWidth / 2 - 1.5 + "px";
    bullet.style.top = enemyRect.top - containerRect.top + "px";
    container.appendChild(bullet);

    const moveBullet = setInterval(() => {
      const currentTop = parseInt(bullet.style.top);
      bullet.style.top = currentTop - 5 + "px";
      const bulletRect = bullet.getBoundingClientRect();
      const playerRect = player.getBoundingClientRect();

      if (checkCollision(bulletRect, playerRect)) {
        clearInterval(moveBullet);
        bullet.remove();
        playerLives--;
        updateHeartsDisplay();

        if (playerLives <= 0) {
          document.body.innerHTML =
            '<h1 style="color:red;font-size:50px;text-align:center;margin-top:20%;">FIN DEL JUEGO</h1>';
        }
      }

      if (currentTop < -15) {
        clearInterval(moveBullet);
        bullet.remove();
      }
    }, 30);
  });
}

function updateHeartsDisplay() {
  const hearts = document.querySelectorAll("#indicatorHealth");
  hearts.forEach((heart, index) => {
    heart.style.display = index < playerLives ? "inline-block" : "none";
  });
}

setInterval(enemyShoot, 1000);

function checkCollision(rect1, rect2) {
  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}

function damageEnemy(enemy, damage) {
  let health = parseInt(enemy.dataset.health);
  health -= damage;
  if (health < 0) health = 0;
  enemy.dataset.health = health.toString();

  const healthBar = enemy.nextElementSibling;
  healthBar.style.width = (health / 100) * 50 + "px";
  healthBar.classList.toggle("low-health", health < 30);
  return health;
}

function checkLevelCompletion() {
  if (document.querySelectorAll(".enemy").length === 0) {
    nlevel += 1;
    levIndicator.innerHTML = `<h2>Level ${nlevel}</h2>`;
    const enemiesToCreate = Math.min(nlevel, 3);
    for (let i = 0; i < enemiesToCreate; i++) {
      setTimeout(createEnemy, i * 500);
    }
  }
}
updateHeartsDisplay();
for (let i = 0; i < nlevel; i++) {
  createEnemy();
}
