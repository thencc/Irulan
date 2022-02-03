<template>

<header class="header">
  <div class="header-left">
    <h1>Irulan</h1>
    <button class="about-link btn-link-muted" @click="showAbout = true">What is this?</button>
    <Modal :show="showAbout" @close="showAbout = false">
      <h3 class="modal-title">About Irulan</h3>
      <div class="modal-content">
        <p>Irulan is a general purpose utility to interact with Algorand contracts, powered by <a href="https://thencc.github.io/algonautjs/" target="_blank">Algonaut.js</a>.</p>
      </div>
    </Modal>
  </div>
  <div class="header-right">
    <Account />
    <Setup />
  </div>
</header>

<main class="container">
  <div class="left-col">
    <Browser />
    <Log />
  </div>
  <div class="right-col">
    <ContractTool />
    <div class="footer-actions">
      <NewContract />
      <NewAsset />
    </div>
  </div>
</main>

</template>


<script lang="ts">
import { defineComponent } from 'vue';
import state from './state';
import Setup from './components/Setup.vue';
import Log from './components/Log.vue';
import Accounts from './components/Accounts.vue';
import Browser from './components/Browser.vue';
import Account from './components/Account.vue';
import Modal from './components/Modal.vue';

export default defineComponent({
  components: {
    Setup,
    Log,
    Accounts,
    Account,
    Modal,
    Browser
  },
  setup() {
    
  },
  mounted() {
    state.log('Welcome to Irulan!');
  },  
  data() {
    return {
      showAbout: false
    }
  }
})
</script>


<style lang="scss">
@import 'assets/_variables.scss';
@import 'assets/basics.scss';


.header {
  background-color: $bgdark;
  padding: 10px;
  display: flex;
  height: $headerheight;

  h1 {
    flex: 0 0 25%;
  background: linear-gradient(45deg, #FFD78A 0%, #EC66AA 16%, #7B4CDE 33%, #69DEE6 56%, #7B4DDF 70%, #FF6188 85%, #FFD866 100%);
    font-weight: bold;
    font-size: 1.5em;
    margin: 0;
    padding: 0;
    background-size: 800% auto;
  
    color: $yellow;
    background-clip: text;
    text-fill-color: transparent;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  
    animation: shine 300s linear infinite;
    @keyframes shine {
      to {
        background-position: 800% center;
      }
    }
  }
}

.header-left {
  flex: 1 1 20%;
  display: flex;

  h1, .about-link {
    line-height: 2em;
    margin: 0 10px;
  }

  .about-link {
    //margin-left: 20px;
  }
}

.header-right {
  text-align: right;
  flex: 1 1 80%;

  button {
    margin: 5px 5px 0;
  }
}






.actions button {
  margin: 5px 5px 0 5px;

  &:last-child {
    margin-right: 0;
  }
}

header {

  .header-info {
    flex: 0 0 75%;
    text-align: right;
    font-size: 0.8em;
    padding-top: 3px;
    line-height: 1em;
    color: $textlight;
  }
}

.instructions {
  font-size: 0.75em;
  color: $textlight;
}

.module {
  border: 1px solid $border;
  margin: 5px;

  h2 {
    padding: 5px;
    border-bottom: 1px solid $border;
    font-size: 0.7em;
    text-transform: uppercase;
  }

  .module-content {
    padding: 5px;
  }
}

.container {
  display: flex;
  position: absolute;
  top: $headerheight;
  bottom: 0;
  left: 0;
  right: 0;

  .left-col {
    flex: 0 0 40%;
    display: flex;
  }

  .right-col {
    flex: 0 0 60%;

    .module {
      margin-left: 0;
    }
  }
}

.left-col, .right-col {
  display: flex;
  flex-direction: column;

  .module {
    flex: 1 1 25%;
  }
}

// LOG
.terminal {
    background: #000;
    color: white;
    height: 300px;
    overflow-y: scroll;
    padding: 5px;
    font-size: 0.8em;
}

.line.success {
  color: $terminalsuccess;
}

.line.error {
  color: $terminalerror;
}

td {
  border: 1px solid $border;
}

th {
  text-align: left;
}

table {
  margin-bottom: 15px;
}
</style>
