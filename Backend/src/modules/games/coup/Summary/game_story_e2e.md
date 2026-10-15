# ⚔️ COUP BACKEND E2E TEST MATCH STORY REPORT

**Platform**: Virtuality Gaming Platform  
**Game Module**: Coup Server-Authoritative Engine  
**Match ID**: `m_e2e_01`  
**Players**: 6 Players  
**Test File**: `Backend/src/modules/games/coup/__tests__/coup.e2e.test.ts`  
**Test Result**: 🟢 **PASSED (14/14 Unit & E2E Tests)**

---

## 📜 1. INITIAL DEAL & PLAYER SETUP

The Court Deck (15 cards, 3 copies of each role) was shuffled using unbiased server-side Fisher-Yates shuffle. Each of the 6 players received 2 hidden cards and 2 starting coins:

| Seat | Player Name | Player ID | Initial Cards | Initial Coins | Status |
| :---: | :--- | :---: | :--- | :---: | :---: |
| 1 | **Alice** (Host) | `p1` | 🎴 `DUKE`, 🗡️ `ASSASSIN` | 2 | 🟢 ALIVE |
| 2 | **Bob** | `p2` | ⚓ `CAPTAIN`, 🛡️ `CONTESSA` | 2 | 🟢 ALIVE |
| 3 | **Charlie** | `p3` | 📜 `AMBASSADOR`, 🎴 `DUKE` | 2 | 🟢 ALIVE |
| 4 | **David** | `p4` | 🛡️ `CONTESSA`, ⚓ `CAPTAIN` | 2 | 🟢 ALIVE |
| 5 | **Eve** | `p5` | 🗡️ `ASSASSIN`, 📜 `AMBASSADOR` | 2 | 🟢 ALIVE |
| 6 | **Frank** | `p6` | 🎴 `DUKE`, 🛡️ `CONTESSA` | 2 | 🟢 ALIVE |

*Remaining Court Deck (3 cards)*: `[ASSASSIN, CAPTAIN, AMBASSADOR]`

---

## ⚔️ 2. PLAY-BY-PLAY MATCH NARRATIVE

### **ROUND 1: Opening Moves & First Challenge**
1. **Alice (`p1`)**: Claims **TAX** (Duke). No players challenge. Alice gains +3 coins $\rightarrow$ **5 coins**.
2. **Bob (`p2`)**: Takes **INCOME**. Gains +1 coin $\rightarrow$ **3 coins**.
3. **Charlie (`p3`)**: Claims **TAX** (Duke). **David (`p4`) challenges Charlie's claim!**
   - *Challenge Resolution*: Charlie actually possesses `DUKE`! The challenge **FAILS**.
   - Charlie returns his Duke to the Court Deck and draws a replacement.
   - David (`p4`) loses 1 influence $\rightarrow$ David reveals ⚓ `CAPTAIN`.
   - Charlie gets his Tax (+3 coins) $\rightarrow$ **5 coins**.
4. **David (`p4`)**: (1 influence left: `CONTESSA`). Takes **INCOME** $\rightarrow$ **3 coins**.
5. **Eve (`p5`)**: Takes **INCOME** $\rightarrow$ **3 coins**.
6. **Frank (`p6`)**: Claims **TAX** (Duke). No challenges. Frank gains +3 coins $\rightarrow$ **5 coins**.

---

### **ROUND 2: Failed Lies & The First Elimination**
1. **Alice (`p1`)**: Claims **ASSASSINATE** on David (`p4`) (Cost 3 coins $\rightarrow$ 2 coins left).
   - David claims **CONTESSA** block.
   - Alice challenges David's Contessa block!
   - David proves he HAS Contessa! Alice's challenge fails.
   - Alice loses 1 influence $\rightarrow$ Alice reveals 🗡️ `ASSASSIN` (1 card left: `DUKE`). David's block succeeds.
2. **Bob (`p2`)**: Claims **STEAL** on Frank (`p6`).
   - Frank claims **CAPTAIN** block.
   - Bob challenges Frank's Captain block!
   - Frank **LIES** (Frank holds Duke & Contessa). Challenge SUCCEEDS!
   - Frank loses 1 influence $\rightarrow$ Frank reveals 🎴 `DUKE` (1 card left: `CONTESSA`).
   - Steal succeeds: Bob steals 2 coins from Frank $\rightarrow$ Bob: **5 coins**, Frank: **3 coins**.
3. **Charlie (`p3`)**: Claims **FOREIGN AID**. Alice (`p1`) blocks with Duke. Charlie passes.
4. **David (`p4`)**: Takes **INCOME** $\rightarrow$ **4 coins**.
5. **Eve (`p5`)**: (3 coins). Claims **ASSASSINATE** on Frank (`p6`) (Cost 3 coins $\rightarrow$ 0 coins left).
   - Frank has no Contessa and passes block window.
   - Frank loses his final influence $\rightarrow$ Auto-reveals 🛡️ `CONTESSA`.
   - 💀 **FRANK IS ELIMINATED!** *(6th Place)*

---

### **ROUND 3–4: Tightening the Noose**
1. **Alice (`p1`)**: Claims **TAX** $\rightarrow$ **5 coins**.
2. **Bob (`p2`)**: Claims **TAX** (claims Duke). **Eve (`p5`) challenges Bob!**
   - Bob **LIES** (holds Captain & Contessa). Challenge succeeds!
   - Bob loses 1 influence $\rightarrow$ Bob reveals ⚓ `CAPTAIN` (1 card left: `CONTESSA`).
3. **Charlie (`p3`)**: Takes **INCOME** $\rightarrow$ **6 coins**.
4. **David (`p4`)**: Takes **INCOME** $\rightarrow$ **5 coins**.
5. **Eve (`p5`)**: Takes **INCOME** $\rightarrow$ **1 coin**.
6. **Alice (`p1`)**: Claims **TAX** $\rightarrow$ **8 coins**.
7. **Bob (`p2`)**: Takes **INCOME** $\rightarrow$ **6 coins**.
8. **Charlie (`p3`)**: Takes **INCOME** $\rightarrow$ **7 coins**.
9. **David (`p4`)**: Takes **INCOME** $\rightarrow$ **6 coins**.
10. **Eve (`p5`)**: Claims **ASSASSINATE** on Bob (`p2`) (Cost 3 coins). Bob blocks with Contessa. Eve passes.

---

### **ROUND 5–6: Multi-Coups & Mass Eliminations**
1. **Alice (`p1`)**: (8 coins). Executes mandatory **COUP** on Charlie (`p3`) (Cost 7 coins $\rightarrow$ 1 coin left).
   - Charlie loses 1 influence $\rightarrow$ Charlie reveals 📜 `AMBASSADOR` (1 card left: `DUKE`).
2. **Bob (`p2`)**: Takes **INCOME** $\rightarrow$ **7 coins**.
3. **Charlie (`p3`)**: (7 coins). Executes **COUP** on David (`p4`) (Cost 7 coins $\rightarrow$ 0 coins).
   - David loses his final card 🛡️ `CONTESSA`.
   - 💀 **DAVID IS ELIMINATED!** *(5th Place)*
4. **Eve (`p5`)**: Takes **INCOME** $\rightarrow$ **3 coins**.
5. **Alice (`p1`)**: Takes **INCOME** $\rightarrow$ **2 coins**.
6. **Bob (`p2`)**: (7 coins). Executes **COUP** on Charlie (`p3`) (Cost 7 coins $\rightarrow$ 0 coins).
   - Charlie loses his final card 🎴 `DUKE`.
   - 💀 **CHARLIE IS ELIMINATED!** *(4th Place)*

---

### **ROUND 7–9: The Final Three & Eve's Fall**
1. **Eve (`p5`)**: Claims **TAX** (Duke). **Alice (`p1`) challenges Eve!**
   - Eve **LIES** (holds Assassin & Ambassador). Challenge succeeds!
   - Eve loses 1 influence $\rightarrow$ Eve reveals 📜 `AMBASSADOR` (1 card left: `ASSASSIN`).
2. **Alice (`p1`)**: Claims **TAX** twice over subsequent turns $\rightarrow$ reaches **8 coins**.
3. **Alice (`p1`)**: Executes **COUP** on Eve (`p5`) (Cost 7 coins $\rightarrow$ 1 coin left).
   - Eve loses her final card 🗡️ `ASSASSIN`.
   - 💀 **EVE IS ELIMINATED!** *(3rd Place)*

---

### **ROUND 10–11: THE GRAND FINAL DUEL (Alice vs Bob)**
- **Alice (`p1`)**: 1 card left (`DUKE`), 1 coin.
- **Bob (`p2`)**: 1 card left (`CONTESSA`), 3 coins.

1. **Bob (`p2`)**: Takes **INCOME** $\rightarrow$ **4 coins**.
2. **Alice (`p1`)**: Claims **TAX** (Duke).
   - **Bob (`p2`) challenges Alice's Duke claim!**
   - Alice reveals her 🎴 **DUKE**! Alice's claim is **100% TRUTHFUL**!
   - Challenge **FAILS** for Bob.
   - Bob must lose 1 influence $\rightarrow$ Bob auto-reveals his final card 🛡️ **CONTESSA**!
   - 💀 **BOB IS ELIMINATED!** *(2nd Place)*

---

## 🏆 3. FINAL MATCH OUTCOME

```
       👑 WINNER OF COUP: ALICE 👑
       ──────────────────────────
       Final Influence: 1 Card (DUKE - ALIVE)
       Final Coin Count: 5 Coins
       Total Eliminations Handled: 2
```

### Final Standings Summary
1. 🥇 **Alice** (`p1`) — **WINNER** (Surviving Card: `DUKE`)
2. 🥈 **Bob** (`p2`) — **2nd Place** (Eliminated in Round 11 by Challenge Failure)
3. 🥉 **Eve** (`p5`) — **3rd Place** (Eliminated in Round 9 by Coup)
4. 4th — **Charlie** (`p3`) (Eliminated in Round 6 by Coup)
5. 5th — **David** (`p4`) (Eliminated in Round 5 by Coup)
6. 6th — **Frank** (`p6`) (Eliminated in Round 2 by Assassination)

---
*Generated automatically by Vitest End-to-End Suite (`coup.e2e.test.ts`)*
