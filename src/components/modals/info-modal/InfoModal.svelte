<script lang="ts">
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import InfoModalSection from "./InfoModalSection.svelte";
  import { showInfoModal } from "../../../stores/Modals";
  import Spacer from "../../layout/Spacer.svelte";

  /**
   * The function to run when the modal closes.
   */
  function onClose() {
    $showInfoModal = false;
  }
</script>

<ModalBody title={"Common Questions and Other Information"} onClose={onClose}>
  <div class="content">
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
    <InfoModalSection title={"Data Usage"}>
      Steam Art Manager (SARM) does not use any data other than what you provide it. The data you do provide it with (API keys and your Steam Install location) is only used to allow the app to function, and never leaves your computer. If you would like to see where this information is stored, read the <b>Where is My Data Stored?</b> section below. 
    </InfoModalSection>
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
    <InfoModalSection title={"Where is My Data Saved?"}>
      On Windows systems, settings are stored in <b>C:\Users\YOUR_USERNAME\AppData\Roaming\dev.tormak.steam-art-manager\settings.json</b>. On Linux systems, they are stored in <b>~/.config/dev.tormak.steam-art-manager/settings.json</b>.
    </InfoModalSection>
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
    <InfoModalSection title={"Why Should I Provide an API Key?"}>
      The main benifit of providing a Steam API key is that it allows SARM to load your games faster (especially for larger libraries), and include games marked as <b>private</b> in your library.
    </InfoModalSection>
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
  </div>
</ModalBody>

<style>
  .content {
		width: 600px;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>
